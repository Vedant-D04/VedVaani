import { Post } from '../types/models';

export type RootStackParamList = {
  MainTabs: undefined;
  PostDetail: { post: Post };
  UserProfile: { userId: string };
};

export type MainTabParamList = {
  Feed: undefined;
  Explore: undefined;
  Record: undefined;
  Profile: undefined;
};
