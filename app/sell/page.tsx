async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const supabase = supabaseBrowser();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("Please log in before publishing a listing.");
    return;
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const currencyCode = String(
    formData.get("currency") || "GHS"
  ).trim();

  const region = String(formData.get("region") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const ghanaPostGps = String(
    formData.get("ghanaPostGps") || ""
  ).trim();
  const locationDetails = String(
    formData.get("locationDetails") || ""
  ).trim();

  const sellerName = String(
    formData.get("sellerName") || ""
  ).trim();

  const phone = String(formData.get("phone") || "").trim();

  const email = String(formData.get("email") || "").trim();

  if (!title || !price || !category || !subcategory) {
    alert(
      "Please complete the required listing information."
    );
    return;
  }

  const location = [
    region,
    city,
    ghanaPostGps,
    locationDetails,
  ]
    .filter(Boolean)
    .join(", ");

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      category_id: null,
      title,
      description,
      price,
      currency_code: currencyCode,
      location,
      status: "active",
      featured: false,
      category,
      subcategory,
      currency: currencyCode,
    })
    .select()
    .single();

  if (error) {
    console.error("LISTING INSERT ERROR:", error);

    alert(
      `Unable to publish listing: ${error.message}`
    );

    return;
  }

  console.log("LISTING CREATED:", listing);

  alert(
    "Listing published successfully!"
  );

  window.location.href = "/dashboard/listings";
}
