import { useState } from '@ts-lite/core';

export default function MyComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <input
        value={state.name}
        onChange={(event) => (state.name = event.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
