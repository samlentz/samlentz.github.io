import React, {useState} from "../_snowpack/pkg/react.js";
import LeaderboardTable from "./LeaderboardTable.js";
import "./index2.css.proxy.js";
import SubmitMatchForm from "./SubmitMatchForm.js";
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "App"
  }, !isModalOpen && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Leaderboard"), /* @__PURE__ */ React.createElement(LeaderboardTable, null), /* @__PURE__ */ React.createElement("button", {
    onClick: () => setIsModalOpen(true)
  }, "Submit Match")), isModalOpen && /* @__PURE__ */ React.createElement("div", {
    className: "modal"
  }, /* @__PURE__ */ React.createElement("h1", null, "Submit"), /* @__PURE__ */ React.createElement("button", {
    onClick: handleCloseModal
  }, "Close"), /* @__PURE__ */ React.createElement(SubmitMatchForm, {
    onSubmit: handleCloseModal
  })));
}
export default App;
