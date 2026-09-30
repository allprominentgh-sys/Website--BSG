"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase/browser";

type Category = {
  id: number;
  name: string;
};

type SelectedPhoto = {
  file: File;
  preview: string;
};

type AdStatus = {
  account_type: string;
  verified: boolean;
  verification_status: string;
  published_ads: number;
  remaining_free_ads: number;
  verification_required: boolean;
};

const FALLBACK_CATEGORIES = [
  "Phones & Tablets",
  "Cars & Vehicles",
  "Property",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Agriculture",
  "Jobs & Services",
];

const MAX_PHOTOS = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function PostAdPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);

  const [adStatus, setAdStatus] = useState<AdStatus | null>(null);
  const [adStatusLoading, setAdStatusLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Load marketplace categories.
   */
  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const supabase = supabaseBrowser();

        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        if (mounted && data && data.length > 0) {
          setCategories(data as Category[]);
        } else if (mounted) {
          setCategories(
            FALLBACK_CATEGORIES.map((name, index) => ({
              id: index + 1,
              name,
            }))
          );
        }
      } catch {
        if (mounted) {
          setCategories(
            FALLBACK_CATEGORIES.map((name, index) => ({
              id: index + 1,
              name,
            }))
          );
        }
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Load the seller's current marketplace ad status.
   */
  useEffect(() => {
    let mounted = true;

    const loadAdStatus = async () => {
      try {
        const supabase = supabaseBrowser();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setAdStatus(null);
            setAdStatusLoading(false);
          }

          return;
        }

        const { data, error } = await supabase.rpc(
          "get_my_marketplace_ad_status"
        );

        if (error) {
          throw error;
        }

        if (mounted && data && data.length > 0) {
          const status = data[0];

          setAdStatus({
            account_type: status.account_type,
            verified: Boolean(status.verified),
            verification_status:
              status.verification_status ?? "not_required",
            published_ads: Number(status.published_ads ?? 0),
            remaining_free_ads: Number(
              status.remaining_free_ads ?? 0
            ),
            verification_required: Boolean(
              status.verification_required
            ),
          });
        }
      } catch (error) {
        console.error(
          "Unable to load marketplace ad status:",
          error
        );
      } finally {
        if (mounted) {
          setAdStatusLoading(false);
        }
      }
    };

    loadAdStatus();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Generate a basic listing description.
   */
  const generateDescription = () => {
    if (!title.trim()) {
      setDescription(
        "Enter a product or service title first, then use AI Description."
      );
      return;
    }

    setDescription(
      `${title.trim()} is available on BEST SALES GHANA. ${
        category
          ? `This listing is in the ${category} category. `
          : ""
      }${
        price
          ? `The asking price is GH₵${price}. `
          : ""
      }${
        location
          ? `The item is located in ${location}. `
          : ""
      }Contact the seller for availability, additional details, viewing and delivery arrangements.`
    );
  };

  /*
   * Validate and select photos.
   */
  const handlePhotoSelection = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage("");

    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_PHOTOS - photos.length;

    if (remainingSlots <= 0) {
      setErrorMessage(
        `You can upload a maximum of ${MAX_PHOTOS} photos.`
      );

      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(
      0,
      remainingSlots
    );

    if (selectedFiles.length > remainingSlots) {
      setErrorMessage(
        `Only ${remainingSlots} more photo${
          remainingSlots === 1 ? "" : "s"
        } can be added. Maximum is ${MAX_PHOTOS}.`
      );
    }

    const validPhotos: SelectedPhoto[] = [];

    for (const file of filesToAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMessage(
          `${file.name} is not supported. Please use JPG, PNG or WEBP.`
        );

        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          `${file.name} is larger than 5MB. Please choose a smaller image.`
        );

        continue;
      }

      validPhotos.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (validPhotos.length > 0) {
      setPhotos((current) => [
        ...current,
        ...validPhotos,
      ]);
    }

    event.target.value = "";
  };

  /*
   * Remove a selected photo.
   */
  const removePhoto = (index: number) => {
    setPhotos((current) => {
      const photo = current[index];

      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }

      return current.filter(
        (_, photoIndex) => photoIndex !== index
      );
    });
  };

  /*
   * Upload one image to the seller-owned Storage folder.
   *
   * Path:
   * seller-user-id / listing-id / unique-file-name
   */
  const uploadPhoto = async (
    supabase: ReturnType<typeof supabaseBrowser>,
    userId: string,
    listingId: number,
    photo: SelectedPhoto,
    index: number
  ) => {
    const extension =
      photo.file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safeFileName = `${Date.now()}-${index}-${crypto.randomUUID()}.${extension}`;

    const filePath =
      `${userId}/${listingId}/${safeFileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("listing-images")
        .upload(
          filePath,
          photo.file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: photo.file.type,
          }
        );

    if (uploadError) {
      throw new Error(
        `Photo ${index + 1} could not be uploaded: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error(
        `Photo ${index + 1} was uploaded but its public URL could not be created.`
      );
    }

    return {
      listing_id: listingId,
      image_url: publicUrlData.publicUrl,
    };
  };

  /*
   * Publish listing.
   *
   * The database remains the final authority on whether
   * the seller is allowed to publish.
   */
  const publishListing = async () => {
    setErrorMessage("");
    setMessage("");

    if (!title.trim()) {
      setErrorMessage(
        "Please enter a product or service title."
      );
      return;
    }

    if (!category) {
      setErrorMessage(
        "Please select a category."
      );
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMessage(
        "Please enter a valid price."
      );
      return;
    }

    if (!location.trim()) {
      setErrorMessage(
        "Please enter the listing location."
      );
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        "Please enter a description."
      );
      return;
    }

    if (photos.length === 0) {
      setErrorMessage(
        "Please add at least one clear product photo."
      );
      return;
    }

    /*
     * Friendly frontend check.
     *
     * The database trigger still provides the real security.
     */
    if (
      adStatus &&
      adStatus.verification_required &&
      !adStatus.verified
    ) {
      setErrorMessage(
        "Seller verification is required before you can publish another listing."
      );

      return;
    }

    setLoading(true);

    let createdListingId: number | null = null;

    try {
      const supabase = supabaseBrowser();

      /*
       * Only authenticated users can create marketplace listings.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.push(
          `/login?error=login_required&next=${encodeURIComponent(
            "/post-ad"
          )}`
        );

        return;
      }

      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      /*
       * Find selected category database ID.
       */
      const selectedCategory = categories.find(
        (item) => item.name === category
      );

      /*
       * Create listing.
       *
       * The database trigger checks the seller's
       * publication count before allowing this INSERT.
       */
      const {
        data: listing,
        error: listingError,
      } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: numericPrice,
          currency_code: "GHS",
          currency: "GHS",
          location: location.trim(),

          status: "active",

          /*
           * Paid promotion is NOT activated simply
           * because the checkbox was selected.
           */
          featured: false,

          category: category,

          category_id:
            selectedCategory?.id ?? null,

          subcategory: null,
        })
        .select("id")
        .single();

      if (listingError) {
        if (
          listingError.message.includes(
            "SELLER_VERIFICATION_REQUIRED"
          )
        ) {
          setAdStatus((current) =>
            current
              ? {
                  ...current,
                  verification_required: true,
                  remaining_free_ads: 0,
                }
              : current
          );

          throw new Error(
            "SELLER_VERIFICATION_REQUIRED"
          );
        }

        throw new Error(
          `Listing could not be created: ${listingError.message}`
        );
      }

      if (!listing?.id) {
        throw new Error(
          "The listing was created but no listing ID was returned."
        );
      }

      createdListingId = Number(listing.id);

      /*
       * Upload all selected photos.
       */
      const imageRows = [];

      for (
        let index = 0;
        index < photos.length;
        index++
      ) {
        const imageRow = await uploadPhoto(
          supabase,
          user.id,
          createdListingId,
          photos[index],
          index
        );

        imageRows.push(imageRow);
      }

      /*
       * Save image URLs.
       */
      if (imageRows.length > 0) {
        const {
          error: imageInsertError,
        } = await supabase
          .from("listing_images")
          .insert(imageRows);

        if (imageInsertError) {
          throw new Error(
            `Photos uploaded, but image records could not be saved: ${imageInsertError.message}`
          );
        }
      }

      /*
       * Refresh publication status.
       */
      const {
        data: refreshedStatus,
      } = await supabase.rpc(
        "get_my_marketplace_ad_status"
      );

      if (
        refreshedStatus &&
        refreshedStatus.length > 0
      ) {
        const status = refreshedStatus[0];

        setAdStatus({
          account_type: status.account_type,
          verified: Boolean(status.verified),
          verification_status:
            status.verification_status ??
            "not_required",
          published_ads: Number(
            status.published_ads ?? 0
          ),
          remaining_free_ads: Number(
            status.remaining_free_ads ?? 0
          ),
          verification_required: Boolean(
            status.verification_required
          ),
        });
      }

      /*
       * Promotion remains separate from normal publishing.
       */
      if (featured) {
        setMessage(
          `Listing #${createdListingId} published successfully. Top Ads promotion has not been activated because payment is required.`
        );
      } else {
        setMessage(
          `Listing #${createdListingId} published successfully with ${imageRows.length} photo${
            imageRows.length === 1
              ? ""
              : "s"
          }.`
        );
      }

      /*
       * Go to seller listings.
       */
      setTimeout(() => {
        router.push(
          "/dashboard/listings"
        );

        router.refresh();
      }, 1200);

    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while publishing your listing.";

      if (
        rawMessage ===
        "SELLER_VERIFICATION_REQUIRED"
      ) {
        setErrorMessage(
          "🔐 Seller verification is required. You have used your first 3 free ad publications. Please complete verification before publishing another listing."
        );

        return;
      }

      if (createdListingId) {
        setErrorMessage(
          `${rawMessage} Your listing #${createdListingId} may have been created. Please check My Listings before trying again.`
        );
      } else {
        setErrorMessage(
          rawMessage
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * Determine whether the user is currently blocked.
   */
  const verificationRequired =
    Boolean(
      adStatus?.verification_required &&
      !adStatus?.verified
    );

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
              AP
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
            href="/listings"
            className="font-bold text-blue-600"
          >
            ← Marketplace
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-12">
        <div className="mx-auto max-w-4xl text-white">

          <p className="font-bold text-blue-100">
            SELL ON BEST SALES GHANA
          </p>

          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Create your listing
          </h1>

          <p className="mt-3 max-w-2xl text-blue-50">
            Put your product, service, property or vehicle
            in front of customers across Ghana.
          </p>

        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-4xl px-4 py-10">

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">

          {/* AD STATUS */}
          {!adStatusLoading &&
            adStatus &&
            (adStatus.account_type === "seller" ||
              adStatus.account_type === "business") && (
              <div
                className={`mb-8 rounded-2xl border p-5 ${
                  verificationRequired
                    ? "border-amber-200 bg-amber-50"
                    : "border-blue-100 bg-blue-50"
                }`}
              >

                <div className="flex items-start gap-4">

                  <div className="text-2xl">
                    {verificationRequired
                      ? "🔐"
                      : "📢"}
                  </div>

                  <div className="flex-1">

                    {verificationRequired ? (
                      <>
                        <h3 className="font-extrabold text-amber-900">
                          Seller verification required
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-amber-800">
                          You have used your first{" "}
                          <strong>
                            3 free ad publications
                          </strong>
                          . Complete seller or business
                          verification before publishing
                          another listing.
                        </p>

                        <Link
                          href="/verification"
                          className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                        >
                          Start Verification →
                        </Link>
                      </>
                    ) : adStatus.verified ? (
                      <>
                        <h3 className="font-extrabold text-blue-900">
                          ✓ Verified seller
                        </h3>

                        <p className="mt-1 text-sm text-blue-800">
                          Your seller account is verified.
                          You can continue publishing listings.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-extrabold text-blue-900">
                          Free ad publications
                        </h3>

                        <p className="mt-1 text-sm text-blue-800">
                          You have{" "}
                          <strong>
                            {adStatus.remaining_free_ads}
                          </strong>{" "}
                          free ad publication
                          {adStatus.remaining_free_ads === 1
                            ? ""
                            : "s"}{" "}
                          remaining.
                        </p>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (adStatus.published_ads /
                                  3) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-blue-700">
                          {adStatus.published_ads} of 3
                          free publications used.
                        </p>
                      </>
                    )}

                  </div>

                </div>

              </div>
            )}

          <div className="mb-8">

            <h2 className="text-2xl font-extrabold">
              Listing information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete the information below.
            </p>

          </div>

          {/* SUCCESS */}
          {message && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
              ✓ {message}
            </div>
          )}

          {/* ERROR */}
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              ⚠ {errorMessage}
            </div>
          )}

          {/* TITLE */}
          <div>

            <label className="text-sm font-bold">
              Product / Service title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. iPhone 15 Pro 256GB"
              maxLength={150}
              className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
            />

          </div>

          {/* CATEGORY + PRICE */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div>

              <label className="text-sm font-bold">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                disabled={categoriesLoading}
                className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.name}
                  >
                    {item.name}
                  </option>
                ))}

              </select>

            </div>

            <div>

              <label className="text-sm font-bold">
                Price (GH₵)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="0.00"
                className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* LOCATION */}
          <div className="mt-6">

            <label className="text-sm font-bold">
              Location
            </label>

            <div className="mt-2 flex gap-2">

              <input
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="e.g. Accra, East Legon"
                maxLength={150}
                className="min-w-0 flex-1 rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 font-bold text-blue-600"
              >
                📍 Pin
              </button>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Location pin and live map integration will be
              connected to the delivery system later.
            </p>

          </div>

          {/* PHOTOS */}
          <div className="mt-6">

            <div className="flex items-center justify-between gap-3">

              <label className="text-sm font-bold">
                Product photos
              </label>

              <span className="text-xs font-semibold text-slate-400">
                {photos.length}/{MAX_PHOTOS}
              </span>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoSelection}
              className="hidden"
            />

            <div className="mt-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">

              <div className="text-4xl">
                📷
              </div>

              <p className="mt-3 font-bold">
                Add photos of your item
              </p>

              <p className="mt-1 text-sm text-slate-500">
                JPG, PNG or WEBP • Maximum 5MB each
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  photos.length >= MAX_PHOTOS ||
                  verificationRequired
                }
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Choose Photos
              </button>

            </div>

            {/* PHOTO PREVIEWS */}
            {photos.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">

                {photos.map((photo, index) => (
                  <div
                    key={`${photo.file.name}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border bg-slate-100"
                  >

                    <img
                      src={photo.preview}
                      alt={`Listing photo ${
                        index + 1
                      }`}
                      className="aspect-square w-full object-cover"
                    />

                    {index === 0 && (
                      <div className="absolute left-2 top-2 rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                        Cover
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removePhoto(index)
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-bold text-white shadow"
                      aria-label={`Remove photo ${
                        index + 1
                      }`}
                    >
                      ×
                    </button>

                  </div>
                ))}

              </div>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Your first photo will be treated as the
              cover image.
            </p>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">

            <div className="flex items-center justify-between gap-3">

              <label className="text-sm font-bold">
                Description
              </label>

              <button
                type="button"
                onClick={generateDescription}
                disabled={verificationRequired}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                🤖 AI Description
              </button>

            </div>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={7}
              maxLength={5000}
              placeholder="Describe your product, condition, features and other important information..."
              className="mt-2 w-full resize-none rounded-xl border bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
            />

            <div className="mt-1 text-right text-xs text-slate-400">
              {description.length}/5000
            </div>

          </div>

          {/* TOP AD */}
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-start gap-4">

              <div className="text-3xl">
                ⭐
              </div>

              <div className="flex-1">

                <h3 className="font-extrabold text-blue-800">
                  Promote this listing
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Put your listing in prominent positions
                  and reach more potential customers.
                </p>

                <label className="mt-4 flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) =>
                      setFeatured(e.target.checked)
                    }
                    className="h-5 w-5 accent-blue-600"
                  />

                  <span className="font-bold">
                    Request Top Ads promotion
                  </span>

                </label>

                <p className="mt-2 text-xs text-slate-500">
                  Promotion requires payment and will be
                  connected to the advertising system.
                </p>

              </div>

            </div>

          </div>

          {/* SELLER INFORMATION */}
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">

            <h3 className="font-extrabold">
              Seller information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your logged-in account will automatically be
              attached to this listing.
            </p>

            <div className="mt-4 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                👤
              </div>

              <div>

                <p className="font-bold">
                  Your account
                </p>

                <p className="text-sm text-green-600">
                  ✓ Authenticated seller
                </p>

              </div>

            </div>

          </div>

          {/* SECURITY NOTICE */}
          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">

            <p className="text-sm font-bold text-amber-800">
              🛡️ Marketplace safety
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Only upload genuine product photos. BEST SALES
              GHANA may review listings and remove content
              that violates marketplace rules.
            </p>

          </div>

          {/* VERIFICATION BLOCK */}
          {verificationRequired && (
            <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">

              <div className="flex items-start gap-4">

                <div className="text-3xl">
                  🔐
                </div>

                <div className="flex-1">

                  <h3 className="font-extrabold text-amber-900">
                    Verification required before your next ad
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    You have reached the first 3 ad
                    publications allowed for an unverified
                    seller or business account.
                  </p>

                  <Link
                    href="/verification"
                    className="mt-4 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                  >
                    Continue to Verification →
                  </Link>

                </div>

              </div>

            </div>
          )}

          {/* SUBMIT */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/listings"
              className="rounded-xl border px-6 py-4 text-center font-bold text-slate-600"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={publishListing}
              disabled={
                loading ||
                verificationRequired
              }
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verificationRequired
                ? "Verification Required"
                : loading
                ? "Publishing..."
                : "Publish Listing →"}
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}
