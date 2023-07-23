import React, {useEffect, useMemo, useState, useCallback} from "../_snowpack/pkg/react.js";
import axios from "../_snowpack/pkg/axios.js";
import {useTable} from "../_snowpack/pkg/react-table.js";
const LeaderboardTable = () => {
  const [data, setData] = useState([]);
  const fetchData = useCallback(async () => {
    const result = await axios.get("https://us-central1-famous-sunbeam-382202.cloudfunctions.net/getLeaderboard");
    setData(result.data);
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: "Name"
    },
    {
      Header: "Elo",
      accessor: "Elo"
    },
    {
      Header: "Wins",
      accessor: "Wins"
    },
    {
      Header: "Losses",
      accessor: "Losses"
    }
  ], []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({columns, data});
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", {
    onClick: fetchData,
    classname: "button"
  }, "Refresh Data"), /* @__PURE__ */ React.createElement("table", {
    ...getTableProps(),
    className: "table"
  }, /* @__PURE__ */ React.createElement("thead", null, headerGroups.map((headerGroup) => /* @__PURE__ */ React.createElement("tr", {
    ...headerGroup.getHeaderGroupProps()
  }, headerGroup.headers.map((column) => /* @__PURE__ */ React.createElement("th", {
    ...column.getHeaderProps(),
    className: "th"
  }, column.render("Header")))))), /* @__PURE__ */ React.createElement("tbody", {
    ...getTableBodyProps()
  }, rows.map((row) => {
    prepareRow(row);
    return /* @__PURE__ */ React.createElement("tr", {
      ...row.getRowProps()
    }, row.cells.map((cell) => /* @__PURE__ */ React.createElement("td", {
      ...cell.getCellProps()
    }, cell.render("Cell"))));
  }))));
};
export default LeaderboardTable;
