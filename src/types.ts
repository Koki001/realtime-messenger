export type Profile = {
  id: string;
  // username: string;
  email: string | undefined,
  first_name: string;
  last_name: string;
  // location: string;
  is_private: boolean;
}
export type Group = {
  id: string;
  name: string
}