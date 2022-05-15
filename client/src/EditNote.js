import { gql, useQuery, useMutation } from "@apollo/client";
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { UiEditNote } from "./shared-ui";

const UPDATE_NOTE_MUTATION = gql`
   mutation UpdateNote($id: String!, $content: String!) {
        updateNote(id: $id, content: $content) {
            successful,
            note {
                id
                content
            }
        }
    }
`;

const NOTE_QUERY = gql`
  query GetNote($id: String!) {
    note(id: $id) {
      id
      content
      isSelected @client
    }
  }
`;


export function EditNote() {
    const { noteId } = useParams();
    let { data, loading: notLoading } = useQuery(NOTE_QUERY, {
        variables: {
            id: noteId
        }
    });
    const [updateNote, noteResponse] = useMutation(UPDATE_NOTE_MUTATION);

    if (notLoading || noteResponse && noteResponse.loading && !noteResponse.data)
      return <Spinner />;
    else if (noteResponse?.error)
      return <Heading> Could not load note. </Heading>;
    

    return (
      <UiEditNote
        onSave={(newContent) => {
          updateNote({ variables: { id: noteId, content: newContent } });
        }}
        note={
          noteResponse?.data?.successful ? noteResponse.data?.note : data?.note
        }
        isNoteSelected={data?.note?.isSelected}
      />
    );
}
