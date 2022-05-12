import { Heading, Spinner, Stack, useToast } from "@chakra-ui/react";
import { DeleteButton, UiNote, ViewNoteButton } from "./shared-ui";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { useCallback } from "react";

const ALL_NOTES_QUERY = gql`
  query GetAllNotes($categoryId: String) {
    notes(categoryId: $categoryId) {
      id
      content
      category {
        id
        label
      }
    }
  }
`;

const DELETE_NOTE_MUTATION = gql`
  mutation DeleteNote($noteId: String!) {
    deleteNote(id: $noteId) {
      successful
      note {
        id
      }
    }
  }
`;

export function NoteList({ category }) {
  const { data, loading, error } = useQuery(ALL_NOTES_QUERY, {
    variables: {
      categoryId: category,
    },
    errorPolicy: "all",
  });
  const toast = useToast();

  const [deleteNote, deleteResponse] = useMutation(DELETE_NOTE_MUTATION, {
    //refetchQueries: ["GetAllNotes"],
    optimisticResponse: (vars) => {
      return {
        deleteNote: {
          successful: true,
          __typename: "DeleteNoteResponse",
          note: {
            id: vars.noteId,
            __typename: "Note",
          },
        },
      }
    }, 
    update: (cache, mutationResult) => {
      logger({mutationResult});
        const deletedNoteId = cache.identify(
          mutationResult?.data?.deleteNote?.note
        );
        cache.modify({
          fields: {
            notes: (existingNotes) => {
              logger({ existingNotes });
              return existingNotes.filter((noteRef) => cache.identify(noteRef) !== deletedNoteId);
            },
          },
        });
      cache.evict({ id: deletedNoteId });
    },
  });

  const deleteNoteHandler = useCallback((noteId) => {
      deleteNote({
        variables: {
          noteId,
        },
        errorPolicy: "none",
      }).catch((err) => {
        logger({ err });
        toast({
          title: "failed to delete note",
          description: 'something went wrong',
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return {}
      });
  }, [deleteNote]);

  if (error && !data) {
    return <Heading> Could not load notes. </Heading>;
  }

  if (loading) {
    return <Spinner />;
  }

  const notes = data?.notes.filter((note) => !!note);
  return (
    <Stack spacing={4}>
      {notes?.map((note) => (
        <UiNote
          key={note.id}
          content={note.content}
          category={note.category.label}
        >
          <Link to={`/note/${note.id}`}>
            <ViewNoteButton />
          </Link>
          <DeleteButton
            onClick={deleteNoteHandler.bind(null, note.id)}
            disabled={deleteResponse?.loading}
          />
        </UiNote>
      ))}
    </Stack>
  );
}
 