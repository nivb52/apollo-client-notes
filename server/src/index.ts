const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PubSub, withFilter } from "graphql-subscriptions";
import * as cors from "cors";
import {
  categories as allCategories,
  unpublishedCategories,
  allNotes as allDataNotes,
  unpublishedNotes,
} from "./data"; 

const pubsub = new PubSub();

const typeDefs = gql`
  type Query {
    categories: [Category]
    notes(categoryId: String, offset: Int, limit: Int): [Note]
    note(id: String!): Note
  }
  type Category {
    id: String!
    label: String!
  }
  type Note {
    id: String!
    content: String!
    category: Category!
  }
  type UpdateNoteResponse {
    note: Note
    successful: Boolean!
  }
  type DeleteNoteResponse {
    successful: Boolean!
    note: Note!
  }
  type Mutation {
    updateNote(id: String!, content: String!): UpdateNoteResponse
    deleteNote(id: String!): DeleteNoteResponse
    updateCategory(id: String!, label: String!): Category
  }
  type Subscription {
    newSharedNote(categoryId: String): Note!
  }
`;

let allNotes = allDataNotes;
let categories = allCategories;

const resolvers = {
  Note: {
    category: (parent) => {
      // if (parent.id === "8") {
      //   console.log("ERROR!");
      //   throw new Error(`Could not retrieve note with ID ${parent.id}`);
      // }
      return categories.find((category) => category.id === parent.categoryId);
    },
  },
  Query: {
    notes: (root, args, context) => {
      if (!args.categoryId) {
        return allNotes;
      }
      const categorisedNotes = args.categoryId
        ? allNotes.filter((note) => note.categoryId === args.categoryId)
        : allNotes;
      if (args.offset !== undefined && args.offset !== null && args.limit) {
        return categorisedNotes.slice(args.offset, args.offset + args.limit);
      }
      return categorisedNotes;
    },
    note: (root, args, context) => {
      const noteId = args.id;
      return allNotes.find((note) => note.id === noteId);
    },
    categories: () => categories,
  },
  Mutation: {
    updateNote: (root, args, context) => {
      const noteId = args.id;
      allNotes = allNotes.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            content: args.content,
          };
        }
        return note;
      });
      return {
        note: allNotes.find((note) => note.id === noteId),
        successful: true,
      };
    },
    deleteNote: (root, args, context) => {
      const noteId = args.id;
      if (noteId === "14") {
        throw new Error("Cannot delete note with ID 14");
      }
      const deletedNote = allNotes.find((note) => note.id === noteId);
      allNotes = allNotes.filter((n) => n.id !== noteId);
      return {
        successful: true,
        note: deletedNote,
      };
    },
    updateCategory: (root, args, context) => {
      const categoryId = args.id;
      categories = categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            label: args.label,
          };
        }
        return category;
      });
      return categories.find((note) => note.id === categoryId);
    },
  },
  Subscription: {
    newSharedNote: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["NEW_SHARED_NOTE"]),
        (payload, variables) => {
          if (!variables.categoryId) {
            return true;
          }
          return payload.newSharedNote.categoryId === variables.categoryId;
        }
      ),
    },
  },
};

// For subscription lesson
setInterval(() => {
  if (unpublishedNotes.length === 0) {
    return;
  }
  const newNote = unpublishedNotes.shift();
  allNotes.unshift(newNote);
  pubsub.publish("NEW_SHARED_NOTE", {
    newSharedNote: newNote,
  });
}, 8000);

(async function () {
  const app = express();
  app.use(cors());
  const restRouter = express.Router();

  restRouter.get("/notes", (req, res, next) => {
    const categoryId = req.query["categoryId"];
    const offset = parseInt(req.query["offset"]);
    const limit = parseInt(req.query["limit"]);
    const categorisedNotes = categoryId
      ? allNotes.filter((note) => note.categoryId === categoryId)
      : allNotes;
    const notes = categorisedNotes
      .slice(offset, offset + limit)
      .map((note) => ({
        id: note.id,
        content: note.content,
        category: categories.find((c) => c.id === note.categoryId),
      }));
    res.send(notes);
  });

  restRouter.delete("/notes/:noteId", (req, res, next) => {
    const noteId = req.params.noteId;
    const deletedNote = allNotes.find((note) => note.id === noteId);
    allNotes = allNotes.filter((n) => n.id !== noteId);
    res.send({
      successful: true,
      note: deletedNote,
    });
  });

  app.use("/rest-api", restRouter);

  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
  });
  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath }
  );

  const PORT = 4000;
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  );
})();
