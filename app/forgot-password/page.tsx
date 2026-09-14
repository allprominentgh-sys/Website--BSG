"use client";

import Link from "next/link";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    if (!email) return;

    setSubmitted(true);

  }

  return (

    <main className="min-h-screen bg-slate-50">
