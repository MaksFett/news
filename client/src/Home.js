import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Header from './components/Header'
import ReactLoading from 'react-loading'
import { Container, Row, Col, Tabs, Tab, ListGroup } from 'react-bootstrap'
import ListedArticle from './components/ListedArticle'
import { Link } from 'react-router-dom'


export default function Home() {
    const [login, setlogin] = useState('')
    const [role, setrole] = useState('')
    const [authorized, setAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [articles, setArticles] = useState([])
    const [categories, setCategories] = useState([])
    const [authors, setAuthors] = useState([])
    const [key, setkey] = useState('')
    

    useEffect(() => {
      var MyParams = {headers: {
        Authorization: 'Bearer ' + localStorage.getItem("jwt_token")
      }}
      axios.get('/api/main/readlogin', MyParams)
        .then((response) => {
            setlogin(response.data['login'])
            setrole(response.data['role'])
            setAuth(true)
        }).catch((error) => {
            if ((error.response.status === 401) || (error.response.status === 422)){
                setAuth(false)
            }
            console.log(error)
        })
      setkey('Popular')
      document.title = 'Интернет-издание'
    }, [])
    
    useEffect(() => {
      var MyParams = {}
      if (key === 'Popular') {
        axios.get('/api/main/get_popular_articles', MyParams)
          .then((response) => {
            setArticles(response.data)
          }).catch((error) => {
            console.log(error)
          })
      }
      else if (key === 'Recent') {
        axios.get('/api/main/get_recent_articles', MyParams)
          .then((response) => {
            setArticles(response.data)
          }).catch((error) => {
            console.log(error)
          })
      }
      axios.get('/api/main/get_popular_categories', MyParams)
          .then((response) => {
            setCategories(response.data)
          }).catch((error) => {
            console.log(error)
          })
      axios.get('/api/main/get_popular_authors', MyParams)
          .then((response) => {
            setAuthors(response.data)
          }).catch((error) => {
            console.log(error)
          })
    }, [key])

    useEffect(() => {
        setLoading(false)
    }, [articles])

    const exit = (event) => {
        event.preventDefault()
        localStorage.removeItem("jwt_token")
        setAuth(false)
        setlogin('')
    }

    return (
      <>
        <div className='bg-success'>
          <Header authorized={authorized} login={login} role={role} exit={exit} page={'/'}/>
        {loading ?
          <div className="App-loading">
            <ReactLoading className='position-absolute top-50 start-50 translate-middle' type="spinningBubbles" color="#2081F9" height={150} width={150}/>
          </div>
        :
          <Container fluid>
            <Row>
              <Col xs={2}>
                <div className='my-3 p-3 bg-body-tertiary'>
                  <div className='text-center mb-1'>Популярные категории</div>
                  <ListGroup as="ul">
                    {categories.map((cat) => (
                      <ListGroup.Item as="li">
                        <Link to={'/category/' + cat[0]} style={{textDecoration: 'none', color: 'black'}}>{cat[1]}</Link>
                      </ListGroup.Item>))
                    }
                  </ListGroup>
                </div>
              </Col>
              <Col xs={8}>
                <div className='my-3 p-5 bg-body-tertiary'>
                  <div className='text-center'>
                    <Tabs activeKey={key} onSelect={(k) => setkey(k)} fill>
                      <Tab eventKey='Popular' title='Популярное'></Tab>
                      <Tab eventKey='Recent' title='Свежее'></Tab>
                    </Tabs>
                  </div>
                  <div>
                    <Container fluid className='mt-5'>
                          {articles.map(article => (
                            <Row><Col key={article[0]}><ListedArticle article={article} /></Col></Row>
                          ))}
                    </Container>
                  </div>
                </div>
                {Array(20).fill(1,0,19).map(() => <div>&nbsp;</div>)}
              </Col>
              <Col xs={2}>
              <div className='my-3 p-3 bg-body-tertiary'>
                  <div className='text-center mb-1'>Популярные авторы</div>
                  <ListGroup as="ul">
                    {authors.map((aut) => (
                      <ListGroup.Item as="li">
                        <Link to={'/profile/' + aut[0]} style={{textDecoration: 'none', color: 'black'}}>{aut[1]}</Link>
                      </ListGroup.Item>))
                    }
                  </ListGroup>
                </div>
              </Col>
            </Row>
          </Container>
        }
        </div>
      </>
    );
  }