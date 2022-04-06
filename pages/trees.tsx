import Link from "next/link";
import { FC, useEffect, useMemo, useState } from "react";
import { useTable } from "react-table";

import useSWR from "swr";
import { useUserRole } from "../lib/hooks/useUserRoles";
import { useUser } from "../lib/UserContext";
const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    credentials: "same-origin",
  }).then((res) => res.json());

// Create an editable cell renderer
const EditableCell: FC = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}: any) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<any>) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
  Cell: EditableCell,
};

export default function Trees() {
  const { user, session } = useUser();
  const { userRoles, userRolesError } = useUserRole(user?.id);
  const { data, error } = useSWR<{ id: number; type: string }[]>(
    session
      ? [`${process.env.NEXT_PUBLIC_TREES_API_URL}/trees`, session.access_token]
      : null,
    fetcher
  );
  console.log(userRoles && ["admin", "editor"].includes(userRoles.role));
  const trees = useMemo(() => data, [data]); // might be wired
  const [editColumn, setEditColumn] = useState<{ Cell: JSX.Element } | {}>({});

  const columns = useMemo(
    () => [
      {
        Header: "col 1",
        accessor: "id", // accessor is the "key" in the data
      },
      {
        Header: "col 2",
        accessor: "type",
      },
    ],

    []
  );
  const [skipPageReset, setSkipPageReset] = useState<boolean>(false);

  const {
    getTableProps,

    getTableBodyProps,

    headerGroups,

    rows,

    prepareRow,
  } = useTable({
    columns,
    data: trees ? trees : [],

    // use the skipPageReset option to disable page resetting temporarily
    autoResetPage: !skipPageReset,
    updateMyData: () => {
      setSkipPageReset(true);
      console.log("updateMyData");
    },
    // updateMyData isn't part of the API, but
    // anything we put into these options will
    // automatically be available on the instance.
    // That way we can call this function from our
    // cell renderer!
  }) as any;

  return (
    // apply the table props
    <>
      <Link href="/"> Back to index</Link>
      {userRoles && trees && (
        <table {...getTableProps()}>
          <thead>
            {
              // Loop over the header rows

              headerGroups.map((headerGroup) => (
                // Apply the header row props
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {
                    // Loop over the headers in each row
                    headerGroup.headers.map((column) => (
                      // Apply the header cell props
                      <th {...column.getHeaderProps()}>
                        {
                          // Render the header
                          column.render("Header")
                        }
                      </th>
                    ))
                  }
                </tr>
              ))
            }
          </thead>

          {/* Apply the table body props */}

          <tbody {...getTableBodyProps()}>
            {
              // Loop over the table rows

              rows.map((row) => {
                // Prepare the row for display

                prepareRow(row);

                return (
                  // Apply the row props

                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <>
                          <td {...cell.getCellProps()}>
                            {userRoles &&
                            ["admin", "editor"].includes(userRoles.role) ? (
                              <EditableCell
                                updateMyData={() => {
                                  setSkipPageReset(true);
                                  console.log("updateMyData");
                                }}
                                {...cell}
                              ></EditableCell>
                            ) : (
                              cell.render("Cell")
                            )}
                            {/* {} */}
                          </td>
                        </>
                      );
                    })}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      )}
    </>
  );
}
