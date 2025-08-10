interface Content {
  buttons?: IContentButton[]; // Array of two Button objects
  challenge?: Challenge;
  task?: IExcuseBusterTask;
  responseText: string;
  isFinalStep?: boolean;
  askCoach?: string;
}

interface IContentButton {
  id: string;
  text: string;
  isTextInputPrompt: boolean;
}

interface Challenge {
  description: string;
  durationMinutes: number;
  rewards: Reward;
  title: string;
  askCoach: string;
}

interface Reward {
  // Define the properties of the reward object
  // You can adjust these based on the actual content of the reward
  gems: number;
  xp: number;
}

export interface IExcuseBusterTask {
  title: string;
  description: string;
  durationMinutes: number;
  rewards: Reward;
}

export interface IExcuseBusterMessage {
  content: Content;
  isFinalStep?: boolean;
  type?: string;
  role?: string;
  isError?: boolean;
  isPending?: boolean;
}
