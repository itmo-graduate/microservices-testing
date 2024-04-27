import React from 'react';
import {Box, SxProps} from '@mui/material';
import { LogEntry } from '../types/logs';

interface LogsProps {
  data: LogEntry[];
  sx?: SxProps;
}

export const Logs: React.FC<LogsProps> = ({ data, sx }: LogsProps) => {
  return (
    <Box sx={sx}>
      <h3>Logs</h3>
      {data.length > 0 ? (
        <Box sx={{ maxHeight: 400, overflowY: 'scroll' }}>
          {data.map((log, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 1 }}>
              <span style={{ color: '#0077ff', marginRight: '10px' }}>{log.time}</span>
              <span>{log.message}</span>
            </Box>
          ))}
        </Box>
      ) : (
        <p>No logs yet.</p>
      )}
    </Box>
  );
}