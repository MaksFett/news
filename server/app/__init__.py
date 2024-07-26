from flask import Flask
from instances import db
from .autho.autho import autho_bp
from .reg.reg import reg_bp
from .main.main import main_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app)
app.register_blueprint(autho_bp, url_prefix='/api/autho')
app.register_blueprint(reg_bp, url_prefix='/api/reg')
app.register_blueprint(main_bp, url_prefix='/api/main')
app.config.from_object('config')
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

