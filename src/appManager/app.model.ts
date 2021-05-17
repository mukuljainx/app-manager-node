import mongoose from 'mongoose';

interface IApp {
  name: string;
  icon: string;
  appId: string;
  userId: string;
  type: 'GLOBAL' | 'LOCAL';
  options: {
    width: number | string;
    height: number | string;
  };
}

interface IModelApp extends mongoose.Document, IApp {}

const OptionSchema = new mongoose.Schema({
  width: String,
  height: String,
});

export const AppSchema = new mongoose.Schema(
  {
    name: String,
    icon: String,
    appId: String,
    userId: String,
    type: String,
    options: OptionSchema,
  },
  {
    timestamps: true,
  },
);

export const App = mongoose.model<IModelApp>('App', AppSchema);

export default App;
