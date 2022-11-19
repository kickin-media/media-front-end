import React, { useMemo, useState } from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { PhotoType } from "../../redux/reducers/photo";
import { OutlinedInput } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";

const AuthorFilterForm: React.FC<Props> = ({ photos, onChange }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const authors = useMemo(() => photos.map(photo => ({ [photo.author.id]: photo.author.name }))
    .reduce((prev, cur) => Object.assign(prev, cur), {} as { [key: string]: string }),
    [photos]);

  const sortedAuthors = useMemo(() => Object.keys(authors).sort((a, b) => {
    const nameA = authors[a];
    const nameB = authors[b];

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  }), [authors]);

  return (
    <FormControl sx={{ m: 1 }} size="small">
      <InputLabel id="author-filter-form-label">Authors</InputLabel>
      <Select
        labelId="author-filter-form-label"
        multiple
        value={selected}
        onChange={(e) => {
          const value = e.target.value;
          const res = typeof value === 'string' ? value.split(',') : value;
          setSelected(res);
          if (onChange) onChange(res.length > 0 ? res : null);
        }}
        input={<OutlinedInput label="Authors" />}
        renderValue={selected => selected.map(key => authors[key]).join(', ')}
        MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } }}
      >
        {sortedAuthors.map(key => (
          <MenuItem key={key} value={key}>
            <Checkbox checked={selected.indexOf(key) > -1} />
            <ListItemText primary={authors[key]} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface Props {
  photos: PhotoType[];

  onChange?: (authors: string[] | null) => void;
}

export default AuthorFilterForm;
