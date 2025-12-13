import React, { useState } from "react";
import axios from "axios";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";


export default function AddUser() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState([]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/users`, { name, email });
      Swal.fire({
        icon: "success",
        text: response.data.message || 'User added successfully'
      });
      navigate("/");
    } catch (error) {
      const resp = error.response;
      if (resp && resp.status === 422) {
        const errs = resp.data.errors;
        const messages = Array.isArray(errs)
          ? errs.map((e) => e.msg || e.message || JSON.stringify(e))
          : [resp.data.message || 'Validation error'];
        setValidationError(messages);
      } else {
        Swal.fire({
          text: resp?.data?.message || error.message,
          icon: "error"
        });
      }
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Add User</h4>
              <hr />
              <div className="form-wrapper">
                {
                  validationError && validationError.length > 0 && (
                    <div className="row">
                      <div className="col-12">
                        <div className="alert alert-danger">
                          <ul className="mb-0">
                            {
                              validationError.map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                              ))
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                }
                <Form onSubmit={handleSubmit}>
                  <Row> 
                      <Col>
                        <Form.Group controlId="Name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" value={name} onChange={(event)=>{ setName(event.target.value) }}/>
                        </Form.Group>
                      </Col>  
                  </Row>
                  <Row className="my-3">
                      <Col>
                        <Form.Group controlId="Email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="text" value={email} onChange={(event)=>{ setEmail(event.target.value) }}/>
                        </Form.Group>
                      </Col>
                  </Row>
                  <Button variant="primary" className="mt-2" size="lg" block="block" type="submit">
                    Add
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
