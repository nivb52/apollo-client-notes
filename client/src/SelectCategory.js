import { Box, Select } from "@chakra-ui/react";

function SelectCategory({ onCategoryChange, defaultValue, categories = [] }) {

  return (
    <Box>
      <Select
        placeholder="Select Category"
        defaultValue={defaultValue}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </Select>
    </Box>
  );
}

export { SelectCategory };
