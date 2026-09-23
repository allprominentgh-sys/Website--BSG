"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/browser";

type AccountType = "seller" | "business";

type VerificationRecord = {
  id: number;
  account_type: AccountType;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
};

type FileState = {
  file: File | null;
  name: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export default function VerificationPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [userId, setUserId] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType | null>(null);

  const [existingVerification, setExistingVerification] =
    useState<VerificationRecord | null>(null);

  const [identificationType, setIdentificationType] =
    useState("");

  const [fullName, setFullName] = useState("");

  const [businessName, setBusinessName] =
    useState("");

  const [taxIdentification, setTaxIdentification] =
    useState("");

  const [authorizedRepresentative, setAuthorizedRepresentative] =
    useState("");

  const [identityDocument, setIdentityDocument] =
    useState<FileState>({
      file: null,
      name: "",
    });

  const [passportPhoto, setPassportPhoto] =
    useState<FileState>({
      file: null,
      name: "",
    });

  const [businessRegistration, setBusinessRegistration] =
    useState<FileState>({
      file: null,
      name: "",
    });

  const [representativeId, setRepresentativeId] =
    useState<FileState>({
      file: null,
      name: "",
    });

  const [supportingDocuments, setSupportingDocuments] =
    useState<File[]>([]);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
   * Load authenticated user and profile.
   */
  useEffect(() => {
    let mounted = true;

    const loadVerificationData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace(
            `/login?error=login_required&next=${encodeURIComponent(
              "/verification"
            )}`
          );
          return;
        }

        if (mounted) {
          setUserId(user.id);
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "full_name, account_type"
            )
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (
          !profile ||
          !["seller", "business"].includes(
            profile.account_type
          )
        ) {
          if (mounted) {
            setErrorMessage(
              "Only seller and business accounts require seller verification."
            );
            setLoading(false);
          }

          return;
        }

        if (mounted) {
          setAccountType(
            profile.account_type as AccountType
          );

          setFullName(
            profile.full_name ||
              user.user_metadata?.full_name ||
              ""
          );
        }

        /*
         * Check for an existing verification request.
         */
        const {
          data: verification,
          error: verificationError,
        } = await supabase
          .from("seller_verifications")
          .select(
            "id, account_type, status, rejection_reason, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (verificationError) {
          throw verificationError;
        }

        if (mounted && verification) {
          setExistingVerification(
            verification as VerificationRecord
          );
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load verification information."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVerificationData();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  /*
   * Validate a selected document.
   */
  const validateFile = (
    file: File
  ): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name} is not supported. Please use JPG, PNG, WEBP or PDF.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 10MB. Please choose a smaller file.`;
    }

    return null;
  };

  /*
   * Handle one document.
   */
  const handleSingleFile = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileState>>
  ) => {
    setErrorMessage("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      event.target.value = "";
      return;
    }

    setter({
      file,
      name: file.name,
    });

    event.target.value = "";
  };

  /*
   * Handle multiple supporting documents.
   */
  const handleSupportingDocuments = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage("");

    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      const validationError =
        validateFile(file);

      if (validationError) {
        setErrorMessage(validationError);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSupportingDocuments(
        (current) => [
          ...current,
          ...validFiles,
        ]
      );
    }

    event.target.value = "";
  };

  /*
   * Upload a private verification document.
   */
  const uploadVerificationFile = async (
    file: File,
    userId: string,
    folder: string
  ) => {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "file";

    const safeFileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const filePath =
      `${userId}/${folder}/${safeFileName}`;

    const { error } =
      await supabase.storage
        .from("verification-documents")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

    if (error) {
      throw new Error(
        `Could not upload ${file.name}: ${error.message}`
      );
    }

    return filePath;
  };

  /*
   * Submit verification application.
   */
  const submitVerification = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!userId || !accountType) {
      setErrorMessage(
        "Your account information could not be loaded. Please log in again."
      );
      return;
    }

    /*
     * Do not allow another application while one
     * is pending.
     */
    if (
      existingVerification?.status ===
      "pending"
    ) {
      setErrorMessage(
        "You already have a verification application under review."
      );
      return;
    }

    /*
     * Individual seller validation.
     */
    if (accountType === "seller") {
      if (!fullName.trim()) {
        setErrorMessage(
          "Please enter your full name."
        );
        return;
      }

      if (!identificationType) {
        setErrorMessage(
          "Please select your identification type."
        );
        return;
      }

      if (!identityDocument.file) {
        setErrorMessage(
          "Please upload your identification document."
        );
        return;
      }

      if (!passportPhoto.file) {
        setErrorMessage(
          "Please upload your passport photograph."
        );
        return;
      }
    }

    /*
     * Business validation.
     */
    if (accountType === "business") {
      if (!businessName.trim()) {
        setErrorMessage(
          "Please enter your registered business or company name."
        );
        return;
      }

      if (!taxIdentification.trim()) {
        setErrorMessage(
          "Please enter your tax identification details."
        );
        return;
      }

      if (
        !authorizedRepresentative.trim()
      ) {
        setErrorMessage(
          "Please enter the authorized representative's name."
        );
        return;
      }

      if (!businessRegistration.file) {
        setErrorMessage(
          "Please upload your business registration certificate."
        );
        return;
      }

      if (!representativeId.file) {
        setErrorMessage(
          "Please upload the representative's identification document."
        );
        return;
      }

      if (!passportPhoto.file) {
        setErrorMessage(
          "Please upload the representative's passport photograph."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      /*
       * Upload documents first.
       */
      let identityDocumentPath:
        | string
        | null = null;

      let passportPhotoPath:
        | string
        | null = null;

      let businessRegistrationPath:
        | string
        | null = null;

      let representativeIdPath:
        | string
        | null = null;

      const supportingPaths: string[] = [];

      if (
        accountType === "seller" &&
        identityDocument.file
      ) {
        identityDocumentPath =
          await uploadVerificationFile(
            identityDocument.file,
            userId,
            "identity"
          );
      }

      if (passportPhoto.file) {
        passportPhotoPath =
          await uploadVerificationFile(
            passportPhoto.file,
            userId,
            "passport-photo"
          );
      }

      if (
        accountType === "business" &&
        businessRegistration.file
      ) {
        businessRegistrationPath =
          await uploadVerificationFile(
            businessRegistration.file,
            userId,
            "business-registration"
          );
      }

      if (
        accountType === "business" &&
        representativeId.file
      ) {
        representativeIdPath =
          await uploadVerificationFile(
            representativeId.file,
            userId,
            "representative-id"
          );
      }

      /*
       * Supporting documents.
       */
      for (
        let index = 0;
        index < supportingDocuments.length;
        index++
      ) {
        const path =
          await uploadVerificationFile(
            supportingDocuments[index],
            userId,
            `supporting-${index + 1}`
          );

        supportingPaths.push(path);
      }

      /*
       * Create verification request.
       */
      const { data, error } =
        await supabase
          .from("seller_verifications")
          .insert({
            user_id: userId,
            account_type: accountType,

            status: "pending",

            identification_type:
              accountType === "seller"
                ? identificationType
                : null,

            full_name:
              accountType === "seller"
                ? fullName.trim()
                : null,

            business_name:
              accountType === "business"
                ? businessName.trim()
                : null,

            tax_identification:
              accountType === "business"
                ? taxIdentification.trim()
                : null,

            authorized_representative:
              accountType === "business"
                ? authorizedRepresentative.trim()
                : null,

            identity_document_path:
              identityDocumentPath,

            passport_photo_path:
              passportPhotoPath,

            business_registration_path:
              businessRegistrationPath,

            representative_id_path:
              representativeIdPath,

            supporting_document_paths:
              supportingPaths,
          })
          .select(
            "id, account_type, status, rejection_reason, created_at"
          )
          .single();

      if (error) {
        throw new Error(
          `Verification application could not be submitted: ${error.message}`
        );
      }

      setExistingVerification(
        data as VerificationRecord
      );

      /*
       * Mark the profile as pending.
       */
      await supabase
        .from("profiles")
        .update({
          verification_status: "pending",
        })
        .eq("id", userId);

      setSuccessMessage(
        "Your verification application has been submitted successfully. Our team will review your information."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your verification application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Remove supporting document.
   */
  const removeSupportingDocument = (
    index: number
  ) => {
    setSupportingDocuments(
      (current) =>
        current.filter(
          (_, fileIndex) =>
            fileIndex !== index
        )
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <div className="text-3xl">
            🔐
          </div>

          <p className="mt-3 font-bold">
            Loading verification...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white">
              BS
            </div>

            <div>
              <div className="font-extrabold text-blue-700">
                BEST SALES
              </div>

              <div className="text-xs text-slate-500">
                GHANA
              </div>
            </div>
          </Link>

          <Link
            href="/post-ad"
            className="font-bold text-blue-600"
          >
            ← Post Ad
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">

          <p className="font-bold text-blue-100">
            SELLER VERIFICATION
          </p>

          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">
            Verify your account
          </h1>

          <p className="mt-3 max-w-2xl text-blue-50">
            Verification helps BEST SALES GHANA maintain a
            safer marketplace for buyers and sellers.
          </p>

        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10">

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-bold text-green-700">
            ✓ {successMessage}
          </div>
        )}

        {/* PENDING */}
        {existingVerification?.status ===
          "pending" && (
          <div className="mb-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                ⏳
              </div>

              <div>

                <h2 className="text-xl font-extrabold text-blue-900">
                  Verification under review
                </h2>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  Your verification application has been
                  submitted. Please wait for the review to
                  be completed before submitting another
                  application.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* APPROVED */}
        {existingVerification?.status ===
          "approved" && (
          <div className="mb-8 rounded-3xl border border-green-200 bg-green-50 p-6">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                ✅
              </div>

              <div>

                <h2 className="text-xl font-extrabold text-green-900">
                  Verification approved
                </h2>

                <p className="mt-2 text-sm leading-6 text-green-800">
                  Your seller verification has been
                  approved. You can continue publishing
                  marketplace listings.
                </p>

                <Link
                  href="/post-ad"
                  className="mt-4 inline-flex rounded-xl bg-green-600 px-5 py-3 font-bold text-white"
                >
                  Return to Post Ad →
                </Link>

              </div>

            </div>

          </div>
        )}

        {/* REJECTED */}
        {existingVerification?.status ===
          "rejected" && (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                ⚠️
              </div>

              <div>

                <h2 className="text-xl font-extrabold text-red-900">
                  Previous verification was not approved
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-800">
                  Please review the information and
                  documents before submitting a new
                  application.
                </p>

                {existingVerification.rejection_reason && (
                  <div className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">
                    <strong>Review note:</strong>{" "}
                    {existingVerification.rejection_reason}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* APPLICATION FORM */}
        {existingVerification?.status !==
          "pending" &&
          existingVerification?.status !==
            "approved" && (
          <form
            onSubmit={submitVerification}
            className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"
          >

            <div className="mb-8">

              <h2 className="text-2xl font-extrabold">
                {accountType === "business"
                  ? "Business verification"
                  : "Individual seller verification"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit accurate information and clear
                documents. False or misleading information
                may result in account restrictions.
              </p>

            </div>

            {/* INDIVIDUAL SELLER */}
            {accountType === "seller" && (
              <>
                <div>

                  <label className="text-sm font-bold">
                    Full Name
                  </label>

                  <input
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Full legal name"
                    className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
                  />

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Identification Type
                  </label>

                  <select
                    value={identificationType}
                    onChange={(e) =>
                      setIdentificationType(
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
                  >

                    <option value="">
                      Select identification type
                    </option>

                    <option value="ghana-card">
                      Ghana Card / NIA
                    </option>

                    <option value="passport">
                      Passport
                    </option>

                  </select>

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Identification Document
                  </label>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(event) =>
                      handleSingleFile(
                        event,
                        setIdentityDocument
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 p-3 text-sm"
                  />

                  {identityDocument.name && (
                    <p className="mt-2 text-xs text-green-600">
                      ✓ {identityDocument.name}
                    </p>
                  )}

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Passport Photograph
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleSingleFile(
                        event,
                        setPassportPhoto
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 p-3 text-sm"
                  />

                  {passportPhoto.name && (
                    <p className="mt-2 text-xs text-green-600">
                      ✓ {passportPhoto.name}
                    </p>
                  )}

                </div>
              </>
            )}

            {/* BUSINESS */}
            {accountType === "business" && (
              <>
                <div>

                  <label className="text-sm font-bold">
                    Registered Business / Company Name
                  </label>

                  <input
                    value={businessName}
                    onChange={(e) =>
                      setBusinessName(
                        e.target.value
                      )
                    }
                    placeholder="Registered business name"
                    className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
                  />

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Tax Identification Details
                  </label>

                  <input
                    value={taxIdentification}
                    onChange={(e) =>
                      setTaxIdentification(
                        e.target.value
                      )
                    }
                    placeholder="Tax identification details"
                    className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
                  />

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Authorized Representative
                  </label>

                  <input
                    value={
                      authorizedRepresentative
                    }
                    onChange={(e) =>
                      setAuthorizedRepresentative(
                        e.target.value
                      )
                    }
                    placeholder="Full name of authorized representative"
                    className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
                  />

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Business Registration Certificate
                  </label>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(event) =>
                      handleSingleFile(
                        event,
                        setBusinessRegistration
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 p-3 text-sm"
                  />

                  {businessRegistration.name && (
                    <p className="mt-2 text-xs text-green-600">
                      ✓{" "}
                      {businessRegistration.name}
                    </p>
                  )}

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Representative Identification
                  </label>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(event) =>
                      handleSingleFile(
                        event,
                        setRepresentativeId
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 p-3 text-sm"
                  />

                  {representativeId.name && (
                    <p className="mt-2 text-xs text-green-600">
                      ✓{" "}
                      {representativeId.name}
                    </p>
                  )}

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Representative Passport Photograph
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handleSingleFile(
                        event,
                        setPassportPhoto
                      )
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 p-3 text-sm"
                  />

                  {passportPhoto.name && (
                    <p className="mt-2 text-xs text-green-600">
                      ✓ {passportPhoto.name}
                    </p>
                  )}

                </div>

                <div className="mt-6">

                  <label className="text-sm font-bold">
                    Supporting Company Documents
                  </label>

                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={
                      handleSupportingDocuments
                    }
                    className="mt-2 w-full rounded-xl border bg-slate-50 p-3 text-sm"
                  />

                  {supportingDocuments.length >
                    0 && (
                    <div className="mt-3 space-y-2">

                      {supportingDocuments.map(
                        (file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                          >

                            <span className="truncate">
                              ✓ {file.name}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removeSupportingDocument(
                                  index
                                )
                              }
                              className="ml-3 font-bold text-red-600"
                            >
                              Remove
                            </button>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>
              </>
            )}

            {/* PRIVACY NOTICE */}
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex items-start gap-3">

                <div className="text-xl">
                  🔒
                </div>

                <div>

                  <h3 className="font-extrabold text-blue-900">
                    Your documents are private
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Verification documents are stored in a
                    private verification area and are not
                    displayed as public marketplace images.
                    Access is restricted to your account and
                    authorized marketplace administrators.
                  </p>

                </div>

              </div>

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Verification..."
                : "Submit Verification →"}
            </button>

          </form>
        )}

        {/* SECURITY NOTICE */}
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">

          <p className="font-bold text-amber-900">
            🛡️ Security reminder
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Only submit genuine information and documents
            belonging to you or your registered business.
            BEST SALES GHANA may request additional
            information where necessary for marketplace
            security and compliance.
          </p>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white px-4 py-8">

        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">

          <p>
            © {new Date().getFullYear()} BEST SALES GHANA.
            All rights reserved.
          </p>

          <div className="mt-3 flex justify-center gap-5">

            <Link
              href="/terms"
              className="hover:text-blue-600"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-blue-600"
            >
              Privacy
            </Link>

            <Link
              href="/contact"
              className="hover:text-blue-600"
            >
              Contact
            </Link>

          </div>

        </div>

      </footer>

    </main>
  );
}
