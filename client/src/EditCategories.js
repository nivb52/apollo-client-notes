
import { gql, useQuery, useMutation } from "@apollo/client";
import { UiEditCategories } from "./shared-ui";

const UPDATE_CATEGORY_MUTATION = gql`
    mutation UpdateCategory($id: String!, $label: String!) {
        updateCategory(id: $id, label: $label) {
                id
                label
        }
    }
`;

function EditCategories({categories}) {
    const [onEditCategory] = useMutation(UPDATE_CATEGORY_MUTATION);
    
    return (
        <UiEditCategories
        categories={categories}
        onEditCategory={ (id, label) => onEditCategory({variables: {id, label}}) }
        >
        </UiEditCategories>
    );
}


export { EditCategories };