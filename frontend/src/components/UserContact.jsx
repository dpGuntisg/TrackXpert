import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faImagePortrait, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function UserContact({ created_by }) {
    const { t } = useTranslation();

    return (
        <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-mainYellow" />
                {t("contact.title")}
            </h2>
            
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {created_by?.profile_image?.data ? (
                        <img
                            src={created_by.profile_image.data}
                            alt={`${created_by.username}'s Profile`}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                            <FontAwesomeIcon icon={faImagePortrait} size="2x" className="text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="flex-grow">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-mainYellow" />
                            <span className="text-white font-medium">{created_by?.username || t('common.unknownUser')}</span>
                        </div>
                        
                        {created_by?.email && (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-mainYellow" />
                                <a href={`mailto:${created_by.email}`} className="text-gray-300 hover:text-white transition-colors">
                                    {created_by.email}
                                </a>
                            </div>
                        )}

                        {created_by?.phonenumber && (
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-mainYellow" />
                                <a href={`tel:${created_by.phonenumber}`} className="text-gray-300 hover:text-white transition-colors">
                                    {created_by.phonenumber}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
