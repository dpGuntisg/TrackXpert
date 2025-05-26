import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faInfoCircle, faExclamationTriangle, faBan } from '@fortawesome/free-solid-svg-icons';
import CustomCheckbox from "../CustomCheckbox";

const BanModal = ({ userId, username, onClose, onBanSuccess }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(1);
  const [isPermanent, setIsPermanent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading || !reason.trim()) return;

    try {
      setLoading(true);
      await axiosInstance.post(`/admin/ban/${userId}`, {
        reason,
        duration: isPermanent ? null : duration,
        isPermanent
      });
      toast.success(t("admin.banSuccess"));
      onBanSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.banError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-accentBlue rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-2xl font-bold text-mainYellow mb-6">
          {t('admin.banUser', 'Ban User')}
        </h2>

        {/* Warning about banning */}
        <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-mainYellow mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-2">
                {t('admin.banWarning', 'Warning: Banning a User')}
              </h3>
              <p className="text-gray-300 text-sm">
                {t('admin.banWarningDetail', 'Banning a user will restrict their access to the platform. For temporary bans, their content will be archived. For permanent bans, their content will be deleted.')}
              </p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faInfoCircle} className="text-mainYellow mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-2">
                {t('admin.userInfo', 'User Information')}
              </h3>
              <p className="text-gray-300 text-sm">
                {t('admin.banningUser', 'You are about to ban user:')} <span className="text-mainYellow">{username}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ban type selection */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            {t('admin.banType', 'Ban Type')}
          </label>
          <div className="flex flex-col gap-2">
            <CustomCheckbox
              label={t('admin.temporaryBan', 'Temporary Ban')}
              checked={!isPermanent}
              onChange={() => setIsPermanent(false)}
            />
            <CustomCheckbox
              label={t('admin.permanentBan', 'Permanent Ban')}
              checked={isPermanent}
              onChange={() => setIsPermanent(true)}
            />
          </div>
        </div>

        {/* Duration input (only show for temporary ban) */}
        {!isPermanent && (
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">
              {t('admin.banDuration', 'Duration (days)')}
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
              className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-mainYellow focus:ring-1 focus:ring-mainYellow outline-none"
            />
          </div>
        )}

        {/* Ban reason input */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            {t('admin.banReason', 'Reason for Ban')}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.banReasonPlaceholder', 'Provide a detailed reason for the ban...')}
            className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-mainYellow focus:ring-1 focus:ring-mainYellow outline-none min-h-[100px]"
            required
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              loading || !reason.trim()
                ? 'bg-gray-700 cursor-not-allowed opacity-60'
                : 'bg-mainRed hover:bg-red-700'
            } text-white`}
          >
            <FontAwesomeIcon icon={faBan} />
            {loading ? t('common.loading') : t('admin.banUser', 'Ban User')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanModal; 