import * as React from "react";

import DropDown from "./DropDown";
import questionList from "../utils/question-list";

const QuestionItems = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridGap: "10px",
      }}
    >
      {questionList.map((el) => (
        <div key={el.id}>
          <img src={el.src} alt={el.title} />
          <p>{el.title}</p>
        </div>
      ))}
    </div>
  );
};

export default function DropdownQuestions({
  disabled = false,
  stopCloseOnClickSelf,
  ...rest
}) {
  return (
    <DropDown
      {...rest}
      disabled={disabled}
      stopCloseOnClickSelf={stopCloseOnClickSelf}
    >
      <QuestionItems />
    </DropDown>
  );
}
