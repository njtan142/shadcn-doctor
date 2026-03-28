export const RawButton = () => {
  return (
    <div>
      <button>Click me</button>
      <button type="button" onClick={() => {}}>
        Another button
      </button>
      <button />
      <input />
      <textarea></textarea>
      <select></select>
      <input type="checkbox" />
      <input type="checkbox" role="switch" />
      <div role="switch"></div>
      <input type="radio" />
      <table>
        <tr>
          <td>Cell</td>
        </tr>
      </table>
      <dialog open>Native dialog</dialog>
      <div role="dialog">Custom modal div</div>
      <div role="alert">Warning message</div>
      <span className="badge rounded-full px-2.5 py-0.5 bg-primary text-white">New</span>
      <div className="tag rounded-full px-3 py-1 border">Label</div>
      <img src="/avatar.jpg" className="w-10 h-10 rounded-full" alt="avatar" />
      <img src="/photo.jpg" className="h-8 w-8 rounded-full" />
      <div className="flex">
        <button role="tab" className="tab-active">
          Tab 1
        </button>
        <button role="tab" className="tab-inactive">
          Tab 2
        </button>
      </div>
      <div className="tab-group">
        <button className="tab-item">Tab A</button>
        <button className="tab-item">Tab B</button>
      </div>
    </div>
  );
};
