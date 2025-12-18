export interface Document {
  id: string;
  title: string;
  category: 'Letters' | 'Notifications' | 'Notesheets';
  date: string;
}
