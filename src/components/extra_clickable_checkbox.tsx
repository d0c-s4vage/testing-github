import React from "react";

import type { Handler } from '@/types/handlers';


export type ItemCheckboxProps = {
  checked: boolean;
  changeHandler: Handler<boolean>;
};


/**
 * A checkbox that is extra clickable - wrapped in a div that is also
 * clickable and that expands to 100% width and height of its parent.
 */
export default function ExtraClickableCheckbox({checked, changeHandler}: ItemCheckboxProps): React.ReactElement {
  return (
      <div
        style={{cursor: "pointer"}}
        onChange={(e) => {
          const input = e.target as HTMLInputElement;
          if (input.type == "checkbox") {
            changeHandler(input.checked);
          }
        }}
        onClick={(e) => {
          const input = e.target as HTMLInputElement;
          let checkbox = e.currentTarget.childNodes[0] as HTMLInputElement;
          changeHandler(checkbox.checked);
        }}
      >
        <input
          type="checkbox"
          defaultChecked={checked}
          // don't propagate the click event upwards, only the change event
          onClick={(e) => false}
        />
      </div>
  );
}
