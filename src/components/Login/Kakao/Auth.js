/*eslint-disable*/
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, logout, addStatus } from '../../../reducers/userSlice';
import qs from 'qs';
import apis from '../../../apis/index.js';

const KakaoLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // callback으로 받은 인가코드
  const code = new URL(window.location.href).searchParams.get('code');

  const getToken = async () => {
    const payload = qs.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.REACT_APP_KAKAO_REST_API_KEY,
      redirect_uri: process.env.REACT_APP_KAKAO_REDIRECT_URI_LOGIN,
      code: code,
      client_secret: process.env.REACT_APP_KAKAO_CLIENT_SECRET,
    });
    try {
      // access token 가져오기
      const res = await apis.post(
        'https://kauth.kakao.com/oauth/token',
        payload,
      );
      // Kakao Javascript SDK 초기화
      window.Kakao.init(process.env.REACT_APP_KAKAO_REST_API_KEY);
      // access token 설정
      window.Kakao.Auth.setAccessToken(res.data.access_token);
      // 유저정보 들고오기
      const user = await window.Kakao.API.request({
        url: '/v2/user/me',
      });

      dispatch(
        login({
          email: user.kakao_account.email,
        }),
      );

      const body = {
        email: user.kakao_account.email,
      };

      await apis.post('/api/isUser', body).then((res) => {
        if (res.data.isUser) {
          //db에 유저정보있으면
          dispatch(
            addStatus({
              address: res.data.address,
              isLogin: true,
            }),
          );
          navigate('/');
        } else {
          //db에 유저정보없으면
          navigate('/register');
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getToken();
  }, []);
};

const KakaoLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  localStorage.clear();
  dispatch(logout());
  navigate('/');
};

export { KakaoLogin, KakaoLogout };
