import React, {useState, useEffect} from "../_snowpack/pkg/react.js";
import axios from "../_snowpack/pkg/axios.js";
const SubmitMatchForm = ({onSubmit}) => {
  const [users, setUsers] = useState([]);
  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  useEffect(() => {
    const fetchUsers = async () => {
      const result = await axios.get("https://us-central1-famous-sunbeam-382202.cloudfunctions.net/getUsers");
      setUsers(result.data);
    };
    fetchUsers();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("https://us-central1-famous-sunbeam-382202.cloudfunctions.net/submitMatch", {
        Winner: winner,
        Loser: loser
      });
      alert("Match submitted successfully");
      onSubmit();
    } catch (error) {
      alert("Error submitting match");
    }
  };
  return /* @__PURE__ */ React.createElement("form", {
    onSubmit: handleSubmit
  }, /* @__PURE__ */ React.createElement("label", null, "Winner:", /* @__PURE__ */ React.createElement("select", {
    value: winner,
    onChange: (e) => setWinner(e.target.value)
  }, /* @__PURE__ */ React.createElement("option", {
    value: ""
  }, "--Select--"), users.map((user) => /* @__PURE__ */ React.createElement("option", {
    key: user.Name,
    value: user.Name
  }, user.Name)))), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("label", null, "Loser:", /* @__PURE__ */ React.createElement("select", {
    value: loser,
    onChange: (e) => setLoser(e.target.value)
  }, /* @__PURE__ */ React.createElement("option", {
    value: ""
  }, "--Select--"), users.map((user) => /* @__PURE__ */ React.createElement("option", {
    key: user.Name,
    value: user.Name
  }, user.Name)))), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("input", {
    type: "submit",
    value: "Submit",
    disabled: !winner || !loser
  }));
};
export default SubmitMatchForm;
