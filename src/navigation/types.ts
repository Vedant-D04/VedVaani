import { Post } from '../types/models';

export type RootStackParamList = {
  MainTabs: undefined;
  PostDetail: { post: Post };
};

export type MainTabParamList = {
  Feed: undefined;
  Explore: undefined;
  Record: undefined;
  Profile: undefined;
};
