import { UiAppLayout } from "./shared-ui/UiAppLayout";
import { Stack } from "@chakra-ui/react";
import { NoteList } from "./NoteList";
import { useState } from "react";
import { SelectCategory } from "./SelectCategory";
import { Route } from 'react-router-dom';
import { EditNote } from './EditNote';
import {EditCategories} from "./EditCategories";
import { gql, useQuery, useMutation } from "@apollo/client";

const ALL_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      label
    }
  }
`;

  const categories = [
    { id: "1", label: "✈️ Holiday Planning" },
    { id: "2", label: "🛒 Shopping" },
    { id: "3", label: "📝 Saved articles" },
  ];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("1");
    const { data, loading, error } = useQuery(ALL_CATEGORIES_QUERY);
  if (error && !data) data.categories = categories;
  
  return (
    <UiAppLayout>
      <Stack width={400}>
        <SelectCategory
          categories={data?.categories}
          defaultValue={selectedCategory}
          onCategoryChange={(category) => setSelectedCategory(category)}
        />
        <EditCategories categories={data?.categories} />
        <NoteList category={selectedCategory} />
      </Stack>
      <Route path={"/note/:noteId"}>
        <EditNote />
      </Route>
    </UiAppLayout>
  );
}

export default App;
