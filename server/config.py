from app import app

app.config['JWT_SECRET_KEY'] = 'y82c5goy42c3ur4fx4ugf84xf84g'
app.config['CORS_HEADERS'] = 'Content-Type'

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:42687193@localhost:5432/news"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

