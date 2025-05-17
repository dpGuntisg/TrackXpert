import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faInfoCircle, faExclamationTriangle, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ReportForm = ({ targetType, targetId, triggerComponent }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  const handleSubmit = async () => {
    if (loading || !reason.trim()) return;

    try {
      setLoading(true);
      await axiosInstance.post("/reports/create", {
        targetType,
        targetId,
        reason,
      });
      toast.success(t("report.success"));
      setReason("");
      closeModal();
    } catch (error) {
      toast.error(t("report.error"));
    } finally {
      setLoading(false);
    }
  };

  // Render just the trigger if modal is not visible
  if (!isVisible) {
    return React.cloneElement(triggerComponent, { onClick: openModal });
  }

  // Render the modal when visible
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-accentBlue rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="text-2xl font-bold text-mainYellow mb-6">
          {t('report.title')}
        </h2>

        {/* Warning about false reports */}
        <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-mainYellow mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-2">
                {t('report.warning')}
              </h3>
              <p className="text-gray-300 text-sm">
                {t('report.falseReportWarning', 'Submitting false or malicious reports may result in account suspension or permanent ban. Please ensure your report is accurate and legitimate.')}
              </p>
            </div>
          </div>
        </div>

        {/* Report information notice */}
        <div className="mb-6 bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faInfoCircle} className="text-mainYellow mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-2">
                {t('report.instructions')}
              </h3>
              <p className="text-gray-300 text-sm">
                {t('report.instructionsDetail', 'Please provide specific details about your report. Include relevant information such as timestamps, content details, and why you believe this needs attention.')}
              </p>
            </div>
          </div>
        </div>

        {/* Report reason input */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            {t('report.reasonLabel')}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('report.reasonPlaceholder', 'Describe the issue in detail...')}
            className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-mainYellow focus:ring-1 focus:ring-mainYellow outline-none min-h-[100px]"
            required
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
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
            <FontAwesomeIcon icon={faPaperPlane} />
            {loading ? t('common.loading') : t('report.submit', 'Submit Report')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;