from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,create_refresh_token

from app.extensions import db
from app.models.user import User
from app.utils.decorators import role_required

auth_bp=Blueprint('auth',__name__,url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data=request.get_json()

    email=data.get('email')
    password=data.get('password')
    role = data.get("role", "user")
    if not email or not password:
        return jsonify({"error":"email and password required"}),400
    
    user=User(email=email,role=role)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error":"email already exists"}),409

    return jsonify({"message":"user registered succesfully"}),201


@auth_bp.route('/login',methods=['POST'])
def login():
    data=request.get_json()

    email=data.get('email')
    password=data.get('password')

    user=User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error":"Invalid email or password"}),401
    
    access_token=create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({"access_token":access_token,"refresh_token":refresh_token}),200

@auth_bp.route('/me',methods=['GET'])
@jwt_required()

def me():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)

    return jsonify({
        "id":user_id,
        "email":user.email

    }),200

@auth_bp.route('/admin-only',methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_only():
    return jsonify({'message':'welcome, admin'}),200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)

    return jsonify({"access_token": new_access_token}), 200
