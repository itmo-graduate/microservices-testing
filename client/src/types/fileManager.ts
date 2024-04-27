export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface TreeNode {
  [key: string]: TreeNode | FileItem;
}
