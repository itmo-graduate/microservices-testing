import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Typography, Alert,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {FileItem, TreeNode} from '../types/fileManager';
import { SERVER_HOST as initialServerHost } from '../const';
import CheckIcon from '@mui/icons-material/Check';

const isFile = (item: TreeNode | FileItem): item is FileItem => ('path' in item);
const isTreeNode = (item: TreeNode | FileItem): item is TreeNode => !('path' in item);

const buildFileTree = (files: FileItem[]): TreeNode => {
  const root: TreeNode = {};
  files.forEach(file => {
    const parts = file.path.split('/').filter(part => part.length);
    let current: TreeNode | FileItem = root;
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (isLast) {
        if (!(current as TreeNode)[part]) {
          (current as TreeNode)[part] = file;
        }
      } else {
        if (!(current as TreeNode)[part]) {
          (current as TreeNode)[part] = {};
        }
        current = (current as TreeNode)[part] as TreeNode;
      }
    });
  });

  return root;
};

const FileManager: React.FC = () => {
  // const [files, setFiles] = useState<FileItem[]>([]);
  const [fileTree, setFileTree] = useState<TreeNode>({});
  const [status, setStatus] = useState<String>('');

  const SERVER_HOST = localStorage.getItem('serverHost') || initialServerHost;

  useEffect(() => {
    fetch(`${SERVER_HOST}/files`)
      .then(res => res.json())
      .then(data => {
        // setFiles(data);
        setFileTree(buildFileTree(data));
      });
  }, [status]);

  const downloadFile = (path: string) => window.open(`${SERVER_HOST}/download${path}`);

  const deleteFile = (path: string) => {
    fetch(`${SERVER_HOST}/delete${path}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        console.log('Delete response:', data);
        setStatus(`File ${path} deleted successfully`);
      })
      .catch(error => {
        console.error('Error deleting file:', error);
        setStatus(`There is a problem with removing file ${path}`);
      });
  };

  const renderTree = (node: TreeNode, path = ''): JSX.Element[] => {
    return Object.keys(node).map(key => {
      const value = node[key];
      const newPath = path + '/' + key;

      if (isFile(value)) {
        return (
          <ListItem key={newPath} dense>
            <ListItemIcon>
              <InsertDriveFileIcon />
            </ListItemIcon>
            <ListItemText sx={{'&:hover': {cursor: 'pointer'}}} onClick={() => downloadFile(value.path)} primary={key} />
            <IconButton edge="end" onClick={() => downloadFile(value.path)} >
              <DownloadIcon />
            </IconButton>
            <IconButton edge="end" onClick={() => deleteFile(value.path)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        );
      } else if (isTreeNode(value)) {
        return (
          <TreeItem key={newPath} node={value} path={newPath} name={key} />
        );
      } else {
        return <React.Fragment key={key}></React.Fragment>;
      }
    });
  };

  const TreeItem: React.FC<{ node: TreeNode; path: string; name: string }> = ({ node, path, name }) => {
    const [open, setOpen] = useState(true);

    const handleClick = () => {
      setOpen(!open);
    };

    return (
      <>
        <ListItem onClick={handleClick} dense>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={name} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding style={{ paddingLeft: 25 }}>
            {renderTree(node, path)}
          </List>
        </Collapse>
      </>
    );
  };

  return (
    <>
      <Typography sx={{mt: 2}} variant={'h5'}>File Manager</Typography>
      <List>
        {renderTree(fileTree)}
      </List>
      {status && (
        <Alert sx={{ml: 1, mt: 1}} icon={<CheckIcon fontSize="inherit" />}>
          {status}
        </Alert>
      )}
    </>
  );
};

export default FileManager;
