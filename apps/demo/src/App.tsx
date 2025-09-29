import { Example } from './Example';
import { postsExamples } from './examples/posts';
import { usersExamples } from './examples/users';
import { commentsExamples } from './examples/comments';

import './App.css';
import { CustomFilter } from './CustomFilter';

function App() {
  return (
    <div className="content">
      <h1>Posts</h1>
      {postsExamples.map((example) => (
        <Example key={example.description} example={example} target="posts" />
      ))}
      <CustomFilter target="posts" />
      <h1>Users</h1>
      {usersExamples.map((example) => (
        <Example key={example.description} example={example} target="users" />
      ))}
      <CustomFilter target="users" />
      <h1>Comments</h1>
      {commentsExamples.map((example) => (
        <Example key={example.description} example={example} target="comments" />
      ))}
      <CustomFilter target="comments" />
    </div>
  );
}

export default App;
