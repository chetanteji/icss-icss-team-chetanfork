--
-- PostgreSQL database dump
--

\restrict ZpX1kCI6d6nXAaLgZ2AZvtP02GkLWPD0L47QjdW0axo4iCaYhRIePPbXuq5geCh

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-13 17:40:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 16508)
-- Name: constraint_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.constraint_types (
    id integer NOT NULL,
    code character varying(80) NOT NULL,
    description text,
    default_hardness character varying(10) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    CONSTRAINT constraint_types_default_hardness_check CHECK (((default_hardness)::text = ANY ((ARRAY['HARD'::character varying, 'SOFT'::character varying])::text[])))
);


ALTER TABLE public.constraint_types OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16466)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    group_id bigint NOT NULL,
    group_name text NOT NULL,
    semester integer NOT NULL,
    number_of_students integer NOT NULL,
    CONSTRAINT groups_number_of_students_check CHECK ((number_of_students >= 0)),
    CONSTRAINT groups_semester_check CHECK ((semester > 0))
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16465)
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.groups ALTER COLUMN group_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16432)
-- Name: lecturers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lecturers (
    lecturer_id integer NOT NULL,
    numberoflecturers integer NOT NULL,
    workingavailablity character(1) NOT NULL,
    workinghours integer NOT NULL,
    campus_mode text NOT NULL,
    modulesharing character(1),
    teachingdays date NOT NULL,
    moduletype character(1),
    classduration integer NOT NULL,
    parttime_fulltime text NOT NULL,
    CONSTRAINT lecturers_campus_mode_check CHECK ((campus_mode = ANY (ARRAY['online'::text, 'offline'::text]))),
    CONSTRAINT lecturers_parttime_fulltime_check CHECK ((parttime_fulltime = ANY (ARRAY['parttime'::text, 'fulltime'::text])))
);


ALTER TABLE public.lecturers OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16479)
-- Name: module_requiremnts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module_requiremnts (
    module_id integer NOT NULL,
    module_name character(1) NOT NULL,
    room_type character(1) NOT NULL,
    session_per_week integer,
    semester character(1) NOT NULL,
    total_sessions integer NOT NULL,
    class_duration integer NOT NULL,
    number_of_students integer NOT NULL,
    onsite_online text NOT NULL,
    CONSTRAINT module_requiremnts_onsite_online_check CHECK ((onsite_online = ANY (ARRAY['onsite'::text, 'online'::text])))
);


ALTER TABLE public.module_requiremnts OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16449)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    module_id bigint NOT NULL,
    module_code text,
    module_name text NOT NULL,
    credit_score integer NOT NULL,
    lecture_hours integer NOT NULL,
    emodule_type text NOT NULL,
    assessment_type text NOT NULL,
    semester integer NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16495)
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_number character varying(20) NOT NULL,
    room_type character varying(50) NOT NULL,
    room_capacity integer NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    CONSTRAINT rooms_room_capacity_check CHECK ((room_capacity > 0))
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- TOC entry 5054 (class 0 OID 16508)
-- Dependencies: 225
-- Data for Name: constraint_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.constraint_types (id, code, description, default_hardness, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 5051 (class 0 OID 16466)
-- Dependencies: 222
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (group_id, group_name, semester, number_of_students) FROM stdin;
\.


--
-- TOC entry 5048 (class 0 OID 16432)
-- Dependencies: 219
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lecturers (lecturer_id, numberoflecturers, workingavailablity, workinghours, campus_mode, modulesharing, teachingdays, moduletype, classduration, parttime_fulltime) FROM stdin;
\.


--
-- TOC entry 5052 (class 0 OID 16479)
-- Dependencies: 223
-- Data for Name: module_requiremnts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module_requiremnts (module_id, module_name, room_type, session_per_week, semester, total_sessions, class_duration, number_of_students, onsite_online) FROM stdin;
\.


--
-- TOC entry 5049 (class 0 OID 16449)
-- Dependencies: 220
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (module_id, module_code, module_name, credit_score, lecture_hours, emodule_type, assessment_type, semester) FROM stdin;
\.


--
-- TOC entry 5053 (class 0 OID 16495)
-- Dependencies: 224
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (room_number, room_type, room_capacity, is_available) FROM stdin;
\.


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 221
-- Name: groups_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_group_id_seq', 1, false);


--
-- TOC entry 4898 (class 2606 OID 16522)
-- Name: constraint_types constraint_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.constraint_types
    ADD CONSTRAINT constraint_types_code_key UNIQUE (code);


--
-- TOC entry 4900 (class 2606 OID 16520)
-- Name: constraint_types constraint_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.constraint_types
    ADD CONSTRAINT constraint_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 16478)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- TOC entry 4886 (class 2606 OID 16448)
-- Name: lecturers lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (lecturer_id);


--
-- TOC entry 4894 (class 2606 OID 16494)
-- Name: module_requiremnts module_requiremnts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_requiremnts
    ADD CONSTRAINT module_requiremnts_pkey PRIMARY KEY (module_id);


--
-- TOC entry 4888 (class 2606 OID 16464)
-- Name: modules modules_module_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_module_code_key UNIQUE (module_code);


--
-- TOC entry 4890 (class 2606 OID 16462)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (module_id);


--
-- TOC entry 4896 (class 2606 OID 16505)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_number);


-- Completed on 2026-01-13 17:40:03

--
-- PostgreSQL database dump complete
--

\unrestrict ZpX1kCI6d6nXAaLgZ2AZvtP02GkLWPD0L47QjdW0axo4iCaYhRIePPbXuq5geCh
