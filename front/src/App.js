import logo from './logo.svg';
import './App.css';
import { useQuery, useMutation, gql } from '@apollo/client';
import React, { useState } from 'react';

const GET_USERS = gql`
  query GetAllUsers {
    all {
      id
      name
      email
      age
    }
  }
`;

const GET_USER_WITH_PAGINATION = gql`
  query GetUserWithPagination($page: Int!, $pageSize: Int!, $sortBy: String!) { 
    allWithPagination(page: $page, pageSize: $pageSize, sortBy: $sortBy) { 
      id 
      name 
      email 
      age } 
      }
`;

const ME_QUERY = gql`
  query Me {
    me(id: 1) {
      id
      name
    }
  }
`;

const OLDER_USERS = gql`
  query OlderUsers {
    older(age: 30) {
      id
      name
      age
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $age: Int!) {
    createUser(user: {name: $name, email: $email, age: $age}) {
      id
      name
      email
      age
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $name: String, $email: String, $age: Int) {
    updateUser(userUpdate: {id: $id, name: $name, email: $email, age: $age}) {
      id
      name
      email
      age
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`;


function App() {
  const { data, loading, error } = useQuery(ME_QUERY);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_USERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [sortBy, setSortBy] = useState('default');

  const { data: usersWithPaginationData, loading: usersWithPaginationLoading, error: usersWithPaginationError } = useQuery(GET_USER_WITH_PAGINATION, {
    variables: { page, pageSize, sortBy },
  });
  const { data: olderUsersData, loading: olderUsersLoading, error: olderUsersError } = useQuery(OLDER_USERS);
  const [createUserMutation, { data: createuserData, loading: createdataLoading, error: createdataError }] = useMutation(CREATE_USER);
  const [updateUserMutation, { data: updateuserData, loading: updateuserLoading, error: updateuserError }] = useMutation(UPDATE_USER);
  const [deleteUserMutation, { data: deleteuserData, loading: deleteuserLoading, error: deleteuserError }] = useMutation(DELETE_USER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSortChange = (sortField) => {
    setSortBy(prevSortBy => {
      const base = sortField + '_';
      return prevSortBy === base + 'asc' ? base + 'desc' : base + 'asc';
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDeleteUser = (userId) => {
    deleteUserMutation({
      variables: {
        id: parseInt(userId)
      },
      refetchQueries: [{ query: GET_USER_WITH_PAGINATION, variables: { page, pageSize, sortBy}}]
    });
  };

  if (loading || usersLoading || olderUsersLoading || createdataLoading || updateuserLoading || deleteuserLoading || usersWithPaginationLoading) {
    return <p>Loading...</p>;
  }

  if (error || usersError || olderUsersError || createdataError || updateuserError || deleteuserError || usersWithPaginationError) {
    return <p>Error :({error?.message || usersError?.message || olderUsersError?.message || createdataError?.message || updateuserError?.message || deleteuserError?.message || usersWithPaginationError?.message})</p>;
  }

  return (
    <div className="App p-4">
      <header className="min-h-screen flex flex-col items-center justify-start">
        <h1 className="text-4xl font-bold my-4">Admin Panel for {data?.me?.name || "No Data"}</h1>

        <div className="overflow-x-auto w-full max-w-4xl mb-8">
          <table className="table w-full">
            {/* ... En-tête du tableau ... */}
            <tbody>
              {/* Affichage des utilisateurs */}
              {usersWithPaginationData?.allWithPagination.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>
                    <button onClick={() => handleEditUser(user)} className="btn btn-circle btn-outline">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="btn btn-circle btn-error ml-2">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Filtre de tri et changement de page */}
          <div className="flex justify-center gap-4 mb-4">
            <button className="btn btn-primary" onClick={() => handleSortChange('name')}>
              <i className="fas fa-sort mr-2"></i> Sort by Name
            </button>
            <button className="btn btn-primary" onClick={() => handleSortChange('email')}>
              <i className="fas fa-sort mr-2"></i> Sort by Email
            </button>
            <button className="btn btn-primary" onClick={() => handleSortChange('age')}>
              <i className="fas fa-sort mr-2"></i> Sort by Age
            </button>
          </div>
          <div className="flex justify-center items-center gap-4">
            <button className="btn btn-outline" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              <i className="fas fa-chevron-left mr-2"></i> Previous Page
            </button>
            <span>Page {page}</span>
            <button className="btn btn-outline" onClick={() => handlePageChange(page + 1)}>
              Next Page <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>


        </div>

        {/* Modal pour l'édition de l'utilisateur */}
        {isModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Edit User: {selectedUser?.name}</h3>
              <input id="inputnewname" type="text" placeholder="Name" defaultValue={selectedUser?.name} className="input input-bordered w-full mb-4" />
              <input id="inputnewemail" type="email" placeholder="Email" defaultValue={selectedUser?.email} className="input input-bordered w-full mb-4" />
              <input id="inputnewage" type="number" placeholder="Age" defaultValue={selectedUser?.age} className="input input-bordered w-full mb-4" />
              <div className="modal-action">
                <button className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  const nameInput = document.getElementById("inputnewname").value;
                  const emailInput = document.getElementById("inputnewemail").value;
                  const ageInput = parseInt(document.getElementById("inputnewage").value);
                  updateUserMutation({
                    variables: {
                      id: parseInt(selectedUser.id),
                      name: nameInput,
                      email: emailInput,
                      age: ageInput
                    },
                    refetchQueries: [{ query: GET_USER_WITH_PAGINATION, variables: { page, pageSize, sortBy}}]
                  });
                  handleCloseModal();
                }
                }>Update User</button>
                {updateuserLoading && <p>Updating...</p>}
                {updateuserError && <p>Error :(
                  {console.log(updateuserError)}
                  )
                </p>}
                {updateuserData && <p>Update!</p>}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de création d'utilisateur */}
        <div className="card bg-base-100 shadow-xl w-full max-w-4xl mx-auto">
          <div className="card-body">
            <h2 className="card-title">Create New Friend</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input id="inputname" type="text" placeholder="Name" className="input input-bordered" />
              <input id="inputemail" type="email" placeholder="Email" className="input input-bordered" />
              <input id="inputage" type="number" placeholder="Age" className="input input-bordered" />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => {
                const nameInput = document.getElementById("inputname").value;
                const emailInput = document.getElementById("inputemail").value;
                const ageInput = parseInt(document.getElementById("inputage").value);
                createUserMutation({
                  variables: {
                    name: nameInput,
                    email: emailInput,
                    age: ageInput
                  },
                  context: { clientName: 'auth' },
                  refetchQueries: [{ query: GET_USER_WITH_PAGINATION, variables: { page, pageSize, sortBy } }]
                });
              }}
            >
              Create User
            </button>
          </div>
          {createdataLoading && <p className="text-center mt-4">Creating...</p>}
          {createdataError && <p className="text-error text-center mt-4">Error :({createdataError.message})</p>}
          {createuserData && <p className="text-success text-center mt-4">Created!</p>}
        </div>

      </header>
    </div>
  );
}

export default App;
