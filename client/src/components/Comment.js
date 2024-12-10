import { Card, Container, Row, Col, Button } from 'react-bootstrap'
import axios from 'axios'
import { Formik, Form, Field } from 'formik'
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import AddComment from '@mui/icons-material/AddComment'
import AddBox from '@mui/icons-material/AddBox'

function Comment(props){
    const [answers, setAnswers] = useState([])
    const [is_answering, setisanswering] = useState(false)

    const get_answer_comments = useCallback(() => {
        var MyParams = {data: {'id': props.comment[0], 'article': props.comment[5]}}
        axios.post('/api/main/get_answer_comments', MyParams)
            .then((response) => {
                if (response.data !== 0){
                    setAnswers(response.data)
                }
            }).catch((error) => {
                console.log(error)
            })
    }, [props.comment])

    useEffect(() => {
        get_answer_comments()
    }, [get_answer_comments])

    const add_comment = (values) => {
        var MyParams = {data: {'article_id': props.params.id, 'text': values.text, 'parent_id': props.comment[0], 'login': props.login}}
        axios.post('/api/main/add_comment', MyParams)
            .then((response) => {
                get_answer_comments()
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
    }

    const delete_comment = () => {
        var MyParams = {data: {'id': props.comment[0]}}
        axios.post('/api/main/delete_comment', MyParams)
            .then((response) => {
                window.location.reload()
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
    }

    return(
        <div>
            <Card className='m-2 w-75'>
                <Card.Body>
                    <Card.Text>
                        <Row>
                            <Col>
                                <h5 className='mb-0'><Link to={'/profile/' + props.comment[1]} style={{ textDecoration: 'none', color: 'black' }}>
                                    {props.comment[1]}</Link>
                                </h5> 
                                <div>{props.comment[4] ?? props.comment[4]}</div>
                            </Col>
                            <Col className='text-end'>{props.comment[2]}</Col>
                        </Row>
                        <div className='mt-2 bg-body-tertiary'>{props.comment[3]}</div>
                        <div className='d-flex justify-content-end'>
                            <IconButton color="black" size="small" onClick={() => setisanswering(!is_answering)}>
                                <AddComment />
                            </IconButton>
                        </div>
                    </Card.Text>
                </Card.Body>
            </Card>
            {props.role === 'admin' && <Button onClick={delete_comment} variant='danger'>Удалить комментарий</Button>}
            <Container fluid className='m-1'>
                {(props.authorized && is_answering) ? (<Row>
                    <Col className='mx-3'>
                        <Formik initialValues={{ "text" : ''}} validationSchema={props.schema} onSubmit={(values, {resetForm}) => {add_comment(values); resetForm()}} >
                            {({ handleSubmit, handleChange, handleBlur, values, touched, errors, }) => (
                                <div>
                                    <Form onSubmit={handleSubmit}>
                                        <div className='row'>
                                            <Field
                                                as='textarea'
                                                rows='2'
                                                className='col-4'
                                                name='text' 
                                                type='text' 
                                                placeholder='Комментарий' 
                                                value={values.text} 
                                                onChange={handleChange} 
                                                onBlur={handleBlur}/>
                                            <div className='m-1 col-2 d-flex align-self-center'>
                                            <IconButton type='submit' color='black' size='small'>
                                                <AddBox />
                                            </IconButton>
                                            </div>
                                        </div>
                                        {errors.text && touched.text ? (
                                            <div style = {{color: 'red'}}>{errors.text}</div>
                                        ) : (<div>&nbsp;</div>)}
                                    </Form>
                                </div>
                            )}
                            </Formik>
                    </Col>
                </Row>) : (<></>)}
                {answers.map(answer => (
                    <Row><Col className='ms-5 me-3' key={answer[0]}>
                        <Comment 
                            schema={props.schema} 
                            get_comments={get_answer_comments} 
                            authorized={props.authorized}
                            login={props.login}
                            role={props.role}
                            params={props.params}
                            comment={[...answer, props.comment[5]]} />
                    </Col></Row>
                ))}
            </Container>
        </div>
    )
}

export default Comment;