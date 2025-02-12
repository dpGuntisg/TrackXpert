import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

export const Alert = ({ type = 'info', message }) => {
  const alertConfig = {
    success: {
      icon: faCheckCircle,
      color: 'green',
    },
    error: {
      icon: faExclamationCircle,
      color: 'red',
    },
    warning: {
      icon: faExclamationTriangle,
      color: 'yellow',
    },
    info: {
      icon: faInfoCircle,
      color: 'blue',
    }
  };

  const { icon, color } = alertConfig[type] || alertConfig.info;

  return (
    <div className={`mb-6 p-4 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
      <div className={`flex items-center gap-2 text-${color}-500`}>
        <FontAwesomeIcon icon={icon} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Alert;
