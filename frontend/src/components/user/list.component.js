import React, { useEffect, useState } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios'
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";

export default function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/users");
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/users/${id}`);
    fetchUsers();
  };

  return (
      <div className="container">
          <div className="row">
            <div className='col-12'>
                <Link className='btn btn-primary mb-2 float-end' to={"/add"}>
                    Add User
                </Link>
            </div>
            <div className="col-12">
                <div className="card card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0 text-center">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                              {users.map(u => (
                                <tr key={u.id}>
                                  <td>{u.id}</td>
                                  <td>{u.name}</td>
                                  <td>{u.email}</td>
                                  <td>
                                    <Link to={`/edit/${u.id}`} className='btn btn-success me-2'>Edit</Link>
                                    <Button variant="danger" onClick={()=>deleteUser(u.id)}>
                                        Delete
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
      </div>
  );
}
