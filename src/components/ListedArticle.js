import Card from 'react-bootstrap/Card'
import { useNavigate } from 'react-router-dom'

function ListedArticle(props){
    const navigate = useNavigate()
    const handleClick = () => {
        navigate('/article/' + props.article[0])
    }
    return(
        <div>
            <Card className='mx-5 my-2'>
                <Card.Body onClick={handleClick}>
                    <Card.Title className='mx-2'>{props.article[1]}</Card.Title>
                    <Card.Text>
                        <div className='container'>
                            <div className='row'>
                                <div className='col'>Автор: {props.article[2]}</div> 
                                <div className='col text-end'>{props.article[3]}</div> 
                            </div>
                        </div>
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    )
}

export default ListedArticle;