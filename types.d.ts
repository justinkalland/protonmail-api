import type { LaunchOptions } from 'puppeteer';

export interface ProtonMailConfig {
  username: string;
  password: string;
  puppeteerOpts?: LaunchOptions;
}

export interface Address {
  email: string;
  name: string;
}

export interface Label {
  id: string;
  name: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface Count {
  total: number;
  unread: number;
}

export interface EmailCount {
  labels: Record<string, Count>;
  folders: Record<string, Count>;
}

export interface Conversation {
  id: string;
  subject: string;
  time: Date;
  isStarred: boolean;
  labels: Label[];
  folder: Folder;

  getEmails: () => Promise<Email[]>;
  delete: () => Promise<boolean>;
  move: (folder: Folder) => Promise<boolean>;
  addLabel: (label: Label | string) => Promise<boolean>;
  removeLabel: (label: Label | string) => Promise<boolean>;
  star: () => Promise<void>;
  unstar: () => Promise<void>;
}

export interface Email {
  id: string;
  conversationId: string;
  subject: string;
  time: Date;
  from: Address;
  to: Address[];
  cc: Address[];
  bcc: Address[];
  headers: Record<string, string>;
  isStarred: boolean;
  isRead: boolean;
  labels: Label[];
  folder: Folder;

  getBody: () => Promise<string>;
  delete: () => Promise<boolean>;
  move: (folder: Folder) => Promise<boolean>;
  addLabel: (label: Label | string) => Promise<boolean>;
  removeLabel: (label: Label | string) => Promise<boolean>;
  star: () => Promise<void>;
  unstar: () => Promise<void>;
  getConversation: () => Promise<Conversation>;
  read: () => Promise<void>;
  unread: () => Promise<void>;
}

export interface Address {
  email: string;
  name: string;
}

export interface SendEmailOptions {
  to: Address | string;
  subject: string;
  body: string;
}

export interface ProtonMail {
  close: () => Promise<void>;

  getLabelById: (id: string) => Label | undefined;

  getLabelByName: (name: string) => Label | undefined;

  getFolderById: (id: string) => Folder | undefined;

  getFolderByName: (name: string) => Folder | undefined;

  createFolder: (name: string) => Promise<Folder>;

  createLabel: (name: string) => Promise<Label>;

  getEmailCounts: () => Promise<EmailCount>;

  getConversationCounts: () => Promise<EmailCount>;

  getConversation: (id: string) => Promise<Conversation | undefined>;

  getConversations: (
    folderOrLabel: Folder | Label | string = 'all',
    page: number = 0,
  ) => Promise<Conversation[]>;

  getEmail: (id: string) => Promise<Email | undefined>;

  getEmails: (folderOrLabel: Folder | Label | string = 'all', page: number = 0) => Promise<Email[]>;

  sendEmail: (options: SendEmailOptions) => Promise<Email>;
}

export interface ProtonMailStatic {
  new(): ProtonMail;

  connect: (config: ProtonMailConfig) => Promise<ProtonMail>;
}

const ProtonMail: ProtonMailStatic;

// noinspection JSUnusedGlobalSymbols
export default ProtonMail;
