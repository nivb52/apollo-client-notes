import { Text, Checkbox, Heading, Spinner, Stack, useToast } from "@chakra-ui/react";
import { DeleteButton, UiLoadMoreButton, UiNote, ViewNoteButton } from "./shared-ui";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { Link } from "react-router-dom";
import { useCallback } from "react";
import { selectNoteHandler } from ".";
const ALL_NOTES_QUERY = gql`
  query GetAllNotes($categoryId: String, $offset: Int, $limit: Int) {
    notes(categoryId: $categoryId, offset: $offset, limit: $limit) {
      id
      content
      isSelected @client
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

const NOTE_SUBSCRIPTION = gql`
  subscription NewSharedNote($categoryId: String) {
    newSharedNote(categoryId: $categoryId) {
      id 
      content
      category {
        id
        label
      }
    }      
  }
`;

export function NoteList({ category }) {
  const { data, loading, error, fetchMore } = useQuery(ALL_NOTES_QUERY, {
    variables: {
      categoryId: category,
      offset: 0,
      limit: 3
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


  const responseNote$ = useSubscription(NOTE_SUBSCRIPTION, {
    variables: {
      categoryId: category,
    }
  });

  if (error && !data) {
    return <Heading> Could not load notes. </Heading>;
  }

  if (loading) {
    return <Spinner />;
  }
  logger({ responseNote$ });
  const newNote = responseNote$?.data?.newSharedNote;
  const recentChanges =
    newNote ? (
      <>
        <Text> Recent Changes </Text>
        <UiNote
          category={newNote.category.label}
          content={newNote.content}
        ></UiNote>
        <Text> --- </Text>
      </>
    ) : '';

  const notes = data?.notes.filter(Boolean);
  const loadMoreNotes = () => {
    fetchMore({
      variables: { offset: notes.length, limit: notes.length + 3 },
    });
  };

  return (
    <Stack spacing={4}>
      {recentChanges}
      {notes?.map((note) => (
        <UiNote
          key={note.id}
          content={note.content}
          category={note.category.label}
          isSelected={note.isSelected}
        >
          <Checkbox
            onChange={selectNoteHandler.bind(null, note.id, !note.isSelected)}
            isChecked={note.isSelected}
          >
            Mark
          </Checkbox>

          <Link to={`/note/${note.id}`}>
            <ViewNoteButton />
          </Link>
          <DeleteButton
            onClick={deleteNoteHandler.bind(null, note.id)}
            disabled={deleteResponse?.loading}
          />
        </UiNote>
      ))}
      <UiLoadMoreButton onClick={loadMoreNotes} />
    </Stack>
  );
}
 