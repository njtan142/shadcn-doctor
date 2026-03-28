export const RawButton = () => {
  return (
    <div>
      <button>Click me</button>
      <button type="button" onClick={() => {}}>Another button</button>
      <button />
      <input />
      <textarea></textarea>
      <select></select>
      <input type="checkbox" />
      <input type="checkbox" role="switch" />
      <div role="switch"></div>
      <input type="radio" />
    </div>
  );
};
