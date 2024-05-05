import React, {useState} from 'react';
import {Alert, Box, Button, TextField, Typography} from '@mui/material';
import { SERVER_HOST as initialServerHost } from '../const';
import CheckIcon from '@mui/icons-material/Check';


const SettingsPage: React.FC = () => {
  const [serverHost, setServerHost] = useState(() => {
    return localStorage.getItem('serverHost') || initialServerHost;
  });

  const [status, setStatus] = useState<String>('');

  const handleServerHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerHost(event.target.value);
  };

  const handleApply = () => {
    setStatus('');
    localStorage.setItem('serverHost', serverHost);
    setStatus('done');
  };

  const handleReset = () => {
    localStorage.removeItem('serverHost');
    setServerHost(initialServerHost);
    setStatus('Server host reset to default!');
  };

  return (
    <Box>
      <Typography sx={{mt: 2}} variant={'h5'}>Settings</Typography>
      <Typography sx={{mt: 2}}>You must specify server host and port if it differs to `current_host:5000`</Typography>
      <TextField
        sx={{mt: 2}}
        label="Server host"
        variant="outlined"
        fullWidth
        value={serverHost}
        onChange={handleServerHostChange}
      />
      {status && (
        <Alert sx={{ml: 1, mt: 1}} icon={<CheckIcon fontSize="inherit" />}>
          {status}
        </Alert>
      )}
      <Button
        sx={{ mt: 2 }}
        variant="contained"
        color="primary"
        onClick={handleApply}
      >
        Apply
      </Button>
      <Button
        sx={{ mt: 2, ml: 2 }}
        variant="outlined"
        color="secondary"
        onClick={handleReset}
      >
        Reset
      </Button>
    </Box>
  );
}

export default SettingsPage;