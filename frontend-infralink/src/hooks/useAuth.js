import useAuthStore from '../store/auth.store.js';
import { ROLES } from '../constants/roles.js';

const useAuth = () => {
  const store = useAuthStore();
  const role = store.user?.role;

  return {
    ...store,
    role,
    isAdmin: role === ROLES.ADMIN,
    isWorker: [ROLES.WORKER, ROLES.LABOUR, ROLES.CONTRACTOR, ROLES.ARCHITECT].includes(role),
    isClient: [ROLES.CLIENT, ROLES.BUILDER, ROLES.NORMAL_USER].includes(role),
    isSupplier: role === ROLES.SUPPLIER,
    isBuilder: role === ROLES.BUILDER,
  };
};

export default useAuth;
