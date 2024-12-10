import React, {useState} from 'react'
import ReactModal from 'react-modal'
import { Button, CloseButton } from 'react-bootstrap'
import { Formik, Form, Field } from 'formik'
import axios from 'axios'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'

function PlagModal({plag_modal, setplagmodal, formValues, setformValues}) {
    const [results, setresults] = useState([])
    const [loading, setLoading] = useState(false)

    const plagiarism_checker = (values) => {
        setLoading(true)
        setformValues(values)
        var myParams = {data : {'title' : values.title, 'text': values.text}}
        axios.post('/api/main/plagiarism_check', myParams)
        .then((response) => {
                setresults(response.data)
                console.log(response)
                setLoading(false)
            }
        ).catch((error) => {
            console.log(error)
            setLoading(false)
        })
    }

    return (
        <ReactModal isOpen={plag_modal} style={{content: {width: '70rem', height: '40rem', left: '13%', right: 'auto', top: '5%', bottom: 'auto'}}}>
            {loading ?
                <div className="App-loading">
                    <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
                </div>
            :
                <div>
                    <Formik initialValues={{ "title" : formValues['title'], "text": formValues['text']}} onSubmit={(values) => {plagiarism_checker(values)}} >
                    {({ handleSubmit, handleChange, handleBlur, values, }) => (
                        <div>
                            <div className='d-flex justify-content-end'>
                                <CloseButton onClick={() => { setformValues(values); setresults([]); setplagmodal(false)} } />
                            </div>
                            <div className="row mb-1">
                                <h4 className="mt-1">Введите название и текст статьи, которая проверится на плагиат, и в ответ будут выведены результаты проверки (список похожих статей)</h4>
                            </div>
                            <Form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="title">Название статьи</label>
                                    <div></div>
                                    <Field className="col-12" 
                                        name='title' 
                                        type='text' 
                                        placeholder='Введите название статьи' 
                                        value={values.title} 
                                        onChange={handleChange} 
                                        onBlur={handleBlur}/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="text">Текст статьи</label>
                                    <div></div>
                                    <Field className="col-12" 
                                        name='text' 
                                        type='text'
                                        as='textarea' 
                                        rows='8'
                                        placeholder='Введите текст статьи' 
                                        value={values.text} 
                                        onChange={handleChange} 
                                        onBlur={handleBlur}/>
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <Button type="submit">Проверить на плагиат</Button>
                                </div>
                            </Form>
                            {results.length !== 0 && <h4>Результаты проверки</h4>}
                            <div>{results.map((res, index) => (
                                <div className='row'>
                                    <div className='col-3'>{index+1}     <Link to={'/article/' + res['id']} style={{textDecoration: 'none', color: 'black'}}>{res['title']}</Link></div>
                                    <div className='col-1'>{res['score']}%</div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </Formik>
                </div>
            }
        </ReactModal>
    );
}

export default PlagModal;