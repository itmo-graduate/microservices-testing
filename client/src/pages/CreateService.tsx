import React, {useState, ChangeEvent} from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  SelectChangeEvent, Alert, Typography
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { Route, Service } from '../types/service';

const CreateService: React.FC = () => {
  const [service, setService] = useState<Service>({
    name: '',
    host: '',
    routes: [],
    usersStart: 0,
    usersEnd: 0,
    duration: 0,
  });
  const [route, setRoute] = useState<Route>({ path: '', method: 'GET' });
  const [status, setStatus] = useState<String>('');

  const handleAddRoute = () => {
    setService({ ...service, routes: [...service.routes, route] });
    setRoute({ path: '', method: 'GET' }); // Сброс состояния текущего маршрута
  };

  const handleSaveService = () => {
    setStatus('');
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    localStorage.setItem('services', JSON.stringify([...services, service]));
    setStatus('saved');
  };

  function removeRoute(index: number) {
    const updatedRoutes = [...service.routes];
    updatedRoutes.splice(index, 1);
    setService({ ...service, routes: updatedRoutes });
  }

  return (
    <Box component="form" sx={{ mt: 3, '& .MuiTextField-root': { m: 1 }, '& .MuiButton-root': { m: 1 } }}>
      <Typography sx={{ml: 1}} variant={'h5'}>Create Service</Typography>
      <TextField
        label="Service Name"
        variant="outlined"
        fullWidth
        value={service.name}
        onChange={(e) => setService({ ...service, name: e.target.value })}
      />
      <TextField
        label="Host"
        variant="outlined"
        fullWidth
        value={service.host}
        onChange={(e) => setService({ ...service, host: e.target.value })}
      />
      <TextField
        label="Start VU arrivalRate"
        variant="outlined"
        type="number"
        fullWidth
        value={service.usersStart}
        onChange={(e) => setService({ ...service, usersStart: parseInt(e.target.value, 10) || 0 })}
      />
      <TextField
        label="End VU arrivalRate"
        variant="outlined"
        type="number"
        fullWidth
        value={service.usersEnd}
        onChange={(e) => setService({ ...service, usersEnd: parseInt(e.target.value, 10) || 0 })}
      />
      <TextField
        label="Duration (seconds)"
        variant="outlined"
        type="number"
        fullWidth
        value={service.duration}
        onChange={(e) => setService({ ...service, duration: parseInt(e.target.value, 10) || 0 })}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Path"
          variant="outlined"
          value={route.path}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRoute({ ...route, path: e.target.value })}
          sx={{ flexGrow: 1 }}
        />
        <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Method</InputLabel>
          <Select
            value={route.method}
            onChange={(e: SelectChangeEvent) => setRoute({ ...route, method: e.target.value as string })}
            label="Method"
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
          </Select>
        </FormControl>
        {(route.method === "POST" || route.method === "PUT" || route.method === "PATCH") && (
          <TextField
            label="Body Fields (comma-separated)"
            variant="outlined"
            fullWidth
            value={route.bodyFields || ''}
            onChange={(e) => setRoute({ ...route, bodyFields: e.target.value })}
            sx={{ flexGrow: 1, mr: 1 }}
          />
        )}
        <IconButton onClick={handleAddRoute} color="primary">
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>
      {service.routes.length === 0 && <Typography sx={{ml: 1}}>Click "+" button to add a route </Typography>}
      {/* Отображение добавленных маршрутов */}
      {service.routes.map((route, index) => (
        <Box key={index} sx={{ border: '1px solid #ddd', p: 2, mt: 2, ml: 1, borderRadius: '4px' }}>
          <p>Path: {route.path}</p>
          <p>Method: {route.method}</p>
          {route.bodyFields && <p>Body Fields: {route.bodyFields}</p>}
          <IconButton onClick={() => removeRoute(index)} color="secondary">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      {status && (
          <Alert sx={{ml: 1, mt: 1}} icon={<CheckIcon fontSize="inherit" />}>
            {status}
          </Alert>
        )}
      <Button variant="contained" color="primary" onClick={handleSaveService}>
        Save Service
      </Button>
    </Box>
  );
};

export default CreateService;
