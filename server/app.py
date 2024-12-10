from flask import Flask
from .instances import db, jwt
from . import config
from .autho.autho import autho_bp
from .reg.reg import reg_bp
from .main.main import main_bp
from .admin.admin import admin_bp
from flask_cors import CORS
from flask_migrate import Migrate


app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app)
app.register_blueprint(autho_bp, url_prefix='/api/autho')
app.register_blueprint(reg_bp, url_prefix='/api/reg')
app.register_blueprint(main_bp, url_prefix='/api/main')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.config.from_object(config)
jwt.init_app(app)
db.init_app(app)
migrate = Migrate(app, db)

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port='5000', use_reloader=False)

