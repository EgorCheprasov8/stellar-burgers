import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors';
import { fetchIngredients } from '@slices/ingredients-slice';
import { checkUserAuth } from '@slices/user-slice';
import { Preloader } from '@ui';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { AppContentProps, TDetailPageProps, TOrderModalProps } from './type';
import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

const ORDER_NUMBER_LENGTH = 6;
const INGREDIENT_DETAILS_TITLE = 'Детали ингредиента';

const formatOrderNumber = (orderNumber: string | undefined): string =>
  `#${String(orderNumber).padStart(ORDER_NUMBER_LENGTH, '0')}`;

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>Нет ингредиентов</p>
    );
  }

  return <RouteComponent />;
};

/* Отдельная страница (при прямом переходе по ссылке или перезагрузке) */
const DetailPage = ({ title, children }: TDetailPageProps): React.JSX.Element => (
  <div className={styles.detailPageWrap}>
    <h3 className={`${styles.detailHeader} text text_type_main-large`}>{title}</h3>
    {children}
  </div>
);

const OrderDetailPage = (): React.JSX.Element => {
  const { number } = useParams();

  return (
    <DetailPage title={formatOrderNumber(number)}>
      <OrderInfo />
    </DetailPage>
  );
};

const OrderModal = ({ onClose }: TOrderModalProps): React.JSX.Element => {
  const { number } = useParams();

  return (
    <Modal title={formatOrderNumber(number)} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  /* background кладут в state ссылки BurgerIngredientUI и OrderCardUI.
     Если он есть — пользователь кликнул внутри приложения: под модалкой
     рисуем страницу, с которой он пришёл. */
  const background = (location.state as { background?: Location } | null)?.background;

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:number" element={<OrderDetailPage />} />
        <Route
          path="/ingredients/:id"
          element={
            <DetailPage title={INGREDIENT_DETAILS_TITLE}>
              <IngredientDetails />
            </DetailPage>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title={INGREDIENT_DETAILS_TITLE} onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={<OrderModal onClose={handleModalClose} />}
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={handleModalClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
