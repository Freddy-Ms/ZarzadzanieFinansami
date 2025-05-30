PGDMP  .    	                }           Finances    17.2    17.2 W    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    33181    Finances    DATABASE     }   CREATE DATABASE "Finances" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Polish_Poland.1250';
    DROP DATABASE "Finances";
                     postgres    false            �            1259    33248    category    TABLE     d   CREATE TABLE public.category (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);
    DROP TABLE public.category;
       public         heap r       postgres    false            �            1259    33247    category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.category_id_seq;
       public               postgres    false    227            �           0    0    category_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;
          public               postgres    false    226            �            1259    33196 	   household    TABLE     |   CREATE TABLE public.household (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    ownership integer
);
    DROP TABLE public.household;
       public         heap r       postgres    false            �            1259    33195    household_id_seq    SEQUENCE     �   CREATE SEQUENCE public.household_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.household_id_seq;
       public               postgres    false    220            �           0    0    household_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.household_id_seq OWNED BY public.household.id;
          public               postgres    false    219            �            1259    33207    household_user    TABLE     h   CREATE TABLE public.household_user (
    user_id integer NOT NULL,
    household_id integer NOT NULL
);
 "   DROP TABLE public.household_user;
       public         heap r       postgres    false            �            1259    33269    product    TABLE     �   CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_id integer,
    subcategory_id integer,
    list_id integer
);
    DROP TABLE public.product;
       public         heap r       postgres    false            �            1259    33268    product_id_seq    SEQUENCE     �   CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.product_id_seq;
       public               postgres    false    231            �           0    0    product_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;
          public               postgres    false    230            �            1259    33334    purchase_event    TABLE     {  CREATE TABLE public.purchase_event (
    id integer NOT NULL,
    user_id integer,
    household_id integer,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    receipt bytea,
    name character varying(255),
    CONSTRAINT purchase_event_check CHECK ((((user_id IS NOT NULL) AND (household_id IS NULL)) OR ((user_id IS NULL) AND (household_id IS NOT NULL))))
);
 "   DROP TABLE public.purchase_event;
       public         heap r       postgres    false            �            1259    33333    purchase_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.purchase_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.purchase_event_id_seq;
       public               postgres    false    235            �           0    0    purchase_event_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.purchase_event_id_seq OWNED BY public.purchase_event.id;
          public               postgres    false    234            �            1259    33312    purchased_product    TABLE     �   CREATE TABLE public.purchased_product (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_id integer,
    subcategory_id integer,
    price numeric(10,2),
    event_id integer
);
 %   DROP TABLE public.purchased_product;
       public         heap r       postgres    false            �            1259    33311    purchased_product_id_seq    SEQUENCE     �   CREATE SEQUENCE public.purchased_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.purchased_product_id_seq;
       public               postgres    false    233            �           0    0    purchased_product_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.purchased_product_id_seq OWNED BY public.purchased_product.id;
          public               postgres    false    232            �            1259    33241    quantity_unit    TABLE     �   CREATE TABLE public.quantity_unit (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    shortcut character varying(10) NOT NULL
);
 !   DROP TABLE public.quantity_unit;
       public         heap r       postgres    false            �            1259    33240    quantity_unit_id_seq    SEQUENCE     �   CREATE SEQUENCE public.quantity_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.quantity_unit_id_seq;
       public               postgres    false    225            �           0    0    quantity_unit_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.quantity_unit_id_seq OWNED BY public.quantity_unit.id;
          public               postgres    false    224            �            1259    33223    shopping_list    TABLE     &  CREATE TABLE public.shopping_list (
    id integer NOT NULL,
    name character varying(255),
    user_id integer,
    household_id integer,
    CONSTRAINT shopping_list_check CHECK ((((user_id IS NOT NULL) AND (household_id IS NULL)) OR ((user_id IS NULL) AND (household_id IS NOT NULL))))
);
 !   DROP TABLE public.shopping_list;
       public         heap r       postgres    false            �            1259    33222    shopping_list_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shopping_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.shopping_list_id_seq;
       public               postgres    false    223            �           0    0    shopping_list_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.shopping_list_id_seq OWNED BY public.shopping_list.id;
          public               postgres    false    222            �            1259    33257    subcategory    TABLE     �   CREATE TABLE public.subcategory (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category_id integer
);
    DROP TABLE public.subcategory;
       public         heap r       postgres    false            �            1259    33256    subcategory_id_seq    SEQUENCE     �   CREATE SEQUENCE public.subcategory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.subcategory_id_seq;
       public               postgres    false    229            �           0    0    subcategory_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.subcategory_id_seq OWNED BY public.subcategory.id;
          public               postgres    false    228            �            1259    33183    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    33182    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            �           2604    33377    category id    DEFAULT     j   ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);
 :   ALTER TABLE public.category ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    227    227            �           2604    33378    household id    DEFAULT     l   ALTER TABLE ONLY public.household ALTER COLUMN id SET DEFAULT nextval('public.household_id_seq'::regclass);
 ;   ALTER TABLE public.household ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    33379 
   product id    DEFAULT     h   ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);
 9   ALTER TABLE public.product ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    230    231            �           2604    33380    purchase_event id    DEFAULT     v   ALTER TABLE ONLY public.purchase_event ALTER COLUMN id SET DEFAULT nextval('public.purchase_event_id_seq'::regclass);
 @   ALTER TABLE public.purchase_event ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    234    235    235            �           2604    33381    purchased_product id    DEFAULT     |   ALTER TABLE ONLY public.purchased_product ALTER COLUMN id SET DEFAULT nextval('public.purchased_product_id_seq'::regclass);
 C   ALTER TABLE public.purchased_product ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    233    233            �           2604    33382    quantity_unit id    DEFAULT     t   ALTER TABLE ONLY public.quantity_unit ALTER COLUMN id SET DEFAULT nextval('public.quantity_unit_id_seq'::regclass);
 ?   ALTER TABLE public.quantity_unit ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    225    225            �           2604    33383    shopping_list id    DEFAULT     t   ALTER TABLE ONLY public.shopping_list ALTER COLUMN id SET DEFAULT nextval('public.shopping_list_id_seq'::regclass);
 ?   ALTER TABLE public.shopping_list ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222    223            �           2604    33384    subcategory id    DEFAULT     p   ALTER TABLE ONLY public.subcategory ALTER COLUMN id SET DEFAULT nextval('public.subcategory_id_seq'::regclass);
 =   ALTER TABLE public.subcategory ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    228    229            �           2604    33385    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            �          0    33248    category 
   TABLE DATA           ,   COPY public.category (id, name) FROM stdin;
    public               postgres    false    227   3j       z          0    33196 	   household 
   TABLE DATA           8   COPY public.household (id, name, ownership) FROM stdin;
    public               postgres    false    220   �j       {          0    33207    household_user 
   TABLE DATA           ?   COPY public.household_user (user_id, household_id) FROM stdin;
    public               postgres    false    221   k       �          0    33269    product 
   TABLE DATA           W   COPY public.product (id, name, quantity, unit_id, subcategory_id, list_id) FROM stdin;
    public               postgres    false    231   7k       �          0    33334    purchase_event 
   TABLE DATA           X   COPY public.purchase_event (id, user_id, household_id, date, receipt, name) FROM stdin;
    public               postgres    false    235   Tk       �          0    33312    purchased_product 
   TABLE DATA           i   COPY public.purchased_product (id, name, quantity, unit_id, subcategory_id, price, event_id) FROM stdin;
    public               postgres    false    233   qk                 0    33241    quantity_unit 
   TABLE DATA           ;   COPY public.quantity_unit (id, name, shortcut) FROM stdin;
    public               postgres    false    225   �k       }          0    33223    shopping_list 
   TABLE DATA           H   COPY public.shopping_list (id, name, user_id, household_id) FROM stdin;
    public               postgres    false    223   �l       �          0    33257    subcategory 
   TABLE DATA           <   COPY public.subcategory (id, name, category_id) FROM stdin;
    public               postgres    false    229   �l       x          0    33183    users 
   TABLE DATA           >   COPY public.users (id, username, email, password) FROM stdin;
    public               postgres    false    218   �o       �           0    0    category_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.category_id_seq', 12, true);
          public               postgres    false    226            �           0    0    household_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.household_id_seq', 10, true);
          public               postgres    false    219            �           0    0    product_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.product_id_seq', 1, false);
          public               postgres    false    230            �           0    0    purchase_event_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.purchase_event_id_seq', 1, false);
          public               postgres    false    234            �           0    0    purchased_product_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.purchased_product_id_seq', 1, false);
          public               postgres    false    232            �           0    0    quantity_unit_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.quantity_unit_id_seq', 24, true);
          public               postgres    false    224            �           0    0    shopping_list_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.shopping_list_id_seq', 1, false);
          public               postgres    false    222            �           0    0    subcategory_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.subcategory_id_seq', 85, true);
          public               postgres    false    228            �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 2, true);
          public               postgres    false    217            �           2606    33255    category category_name_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_name_key UNIQUE (name);
 D   ALTER TABLE ONLY public.category DROP CONSTRAINT category_name_key;
       public                 postgres    false    227            �           2606    33253    category category_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.category DROP CONSTRAINT category_pkey;
       public                 postgres    false    227            �           2606    33201    household household_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.household
    ADD CONSTRAINT household_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.household DROP CONSTRAINT household_pkey;
       public                 postgres    false    220            �           2606    33211 "   household_user household_user_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.household_user
    ADD CONSTRAINT household_user_pkey PRIMARY KEY (user_id, household_id);
 L   ALTER TABLE ONLY public.household_user DROP CONSTRAINT household_user_pkey;
       public                 postgres    false    221    221            �           2606    33274    product product_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.product DROP CONSTRAINT product_pkey;
       public                 postgres    false    231            �           2606    33343 "   purchase_event purchase_event_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.purchase_event
    ADD CONSTRAINT purchase_event_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.purchase_event DROP CONSTRAINT purchase_event_pkey;
       public                 postgres    false    235            �           2606    33317 (   purchased_product purchased_product_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.purchased_product
    ADD CONSTRAINT purchased_product_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.purchased_product DROP CONSTRAINT purchased_product_pkey;
       public                 postgres    false    233            �           2606    33246     quantity_unit quantity_unit_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.quantity_unit
    ADD CONSTRAINT quantity_unit_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.quantity_unit DROP CONSTRAINT quantity_unit_pkey;
       public                 postgres    false    225            �           2606    33229     shopping_list shopping_list_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.shopping_list
    ADD CONSTRAINT shopping_list_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.shopping_list DROP CONSTRAINT shopping_list_pkey;
       public                 postgres    false    223            �           2606    33262    subcategory subcategory_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.subcategory
    ADD CONSTRAINT subcategory_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.subcategory DROP CONSTRAINT subcategory_pkey;
       public                 postgres    false    229            �           2606    33194    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    33190    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           2606    33192    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    218            �           2606    33202 #   household household_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.household
    ADD CONSTRAINT household_created_by_fkey FOREIGN KEY (ownership) REFERENCES public.users(id) ON DELETE SET NULL;
 M   ALTER TABLE ONLY public.household DROP CONSTRAINT household_created_by_fkey;
       public               postgres    false    218    220    4801            �           2606    33217 /   household_user household_user_household_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.household_user
    ADD CONSTRAINT household_user_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.household(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.household_user DROP CONSTRAINT household_user_household_id_fkey;
       public               postgres    false    220    4805    221            �           2606    33212 *   household_user household_user_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.household_user
    ADD CONSTRAINT household_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.household_user DROP CONSTRAINT household_user_user_id_fkey;
       public               postgres    false    4801    218    221            �           2606    33285    product product_list_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.shopping_list(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.product DROP CONSTRAINT product_list_id_fkey;
       public               postgres    false    4809    231    223            �           2606    33280 #   product product_subcategory_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategory(id);
 M   ALTER TABLE ONLY public.product DROP CONSTRAINT product_subcategory_id_fkey;
       public               postgres    false    229    4817    231            �           2606    33275    product product_unit_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.quantity_unit(id);
 F   ALTER TABLE ONLY public.product DROP CONSTRAINT product_unit_id_fkey;
       public               postgres    false    225    231    4811            �           2606    33349 /   purchase_event purchase_event_household_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_event
    ADD CONSTRAINT purchase_event_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.household(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.purchase_event DROP CONSTRAINT purchase_event_household_id_fkey;
       public               postgres    false    4805    235    220            �           2606    33344 *   purchase_event purchase_event_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchase_event
    ADD CONSTRAINT purchase_event_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.purchase_event DROP CONSTRAINT purchase_event_user_id_fkey;
       public               postgres    false    4801    235    218            �           2606    33363 1   purchased_product purchased_product_event_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchased_product
    ADD CONSTRAINT purchased_product_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.purchase_event(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.purchased_product DROP CONSTRAINT purchased_product_event_id_fkey;
       public               postgres    false    4823    233    235            �           2606    33323 7   purchased_product purchased_product_subcategory_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchased_product
    ADD CONSTRAINT purchased_product_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategory(id);
 a   ALTER TABLE ONLY public.purchased_product DROP CONSTRAINT purchased_product_subcategory_id_fkey;
       public               postgres    false    233    4817    229            �           2606    33318 0   purchased_product purchased_product_unit_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.purchased_product
    ADD CONSTRAINT purchased_product_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.quantity_unit(id);
 Z   ALTER TABLE ONLY public.purchased_product DROP CONSTRAINT purchased_product_unit_id_fkey;
       public               postgres    false    225    233    4811            �           2606    33235 -   shopping_list shopping_list_household_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shopping_list
    ADD CONSTRAINT shopping_list_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.household(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.shopping_list DROP CONSTRAINT shopping_list_household_id_fkey;
       public               postgres    false    220    4805    223            �           2606    33230 (   shopping_list shopping_list_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shopping_list
    ADD CONSTRAINT shopping_list_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.shopping_list DROP CONSTRAINT shopping_list_user_id_fkey;
       public               postgres    false    218    4801    223            �           2606    33263 (   subcategory subcategory_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subcategory
    ADD CONSTRAINT subcategory_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.subcategory DROP CONSTRAINT subcategory_category_id_fkey;
       public               postgres    false    4815    227    229            �   �   x�%���0Eg�+:1"R�+�&`c�Z,'ʃ�'	�u}�CA��@��c�r�g��\��DOo��jV5���n�Z���]/ޚd	l�Y���\����pb)��1t��k���|ji���Rp#=U�Dc�"UÁ���#��g<��u@�      z      x�3�I-.����4�24�s��b���� ���      {      x�3�4�2�44������ B�      �      x������ � �      �      x������ � �      �      x������ � �         �   x�=�Mr�0��pg�	��w�ld[uTc�#�N���m7�����`���Дl�z?�`}���c��j�Qz�	�ړ
��fI;ˊ���@��wӌ7(��Yx@:��Λ"'��h��AH��V�HmͼF�`������t��<F:���k��&ϜV�+l鹎��t�1�E~G=�;�*�GR�?����Mѵ Ͼ�c���"q�[d��"��tl      }      x������ � �      �     x�eTɒ�8=C_�����>&N�tMw�+�L.��%�b�"]���y��v��#v�h�'(Kr��ԋ���'V!�+��.��������Q��-�٫C4i��}g�n��X�ZY�]��+Z;��m�zw�m�����=F9��D�!�\҇�C|+����1��\�.xV�X�I�Ԝ;J�'uPߵE ��!J�%m�ӏS����u���iԭ��N΋F��nz[�OA;+��ޟ���u{��i��Yeҵ�LE�W�	����ߠ��"1��J>��t2W-45F��Ol�YIt|ǭ��X�f�V�)�/2zo��Y݊q��?:�=��'�E+6T&r�^�nӽWv�%��h��i��;Nw���!<��[��j�*۲�=+�j,i�E\Ee$��*��m�0�nN�Jʌ6Fz� '!)᎑*�M^�s�A�tO����p�$�j��W�ʙM�`���$�6�?qg�\��V���W-�t	6�G��7�|՟��l����&�Jz�gC\!���T-���ztjf���N�.}V��������eR/n;p�r��p��0�m�QкצkeJK���Ԁ ���Ч�Ś6jq�6��K0�Q|� �P�)�Y5�,G�
v�69.^��ӰH�"c��B��>����8�w}�}�ìͰ|�
^�F�R_���ƅP'��v���e�CM;ƺ+?�5���z��#��n�nu��˓F��(�rA�U`�_	�r��;�Q.d�B�
T�h�]��&r�|���= ���$I~ �G��      x   �   x����N1@��w�\�N��uB���@R��$6��T�I�=*b�oy����k:h����ˬ�Ӫ���G�����U�e��K���o��p^nu�@_�␲Qt�b�b9'�D�S�:�Ą��rU,<�́����0�.�>>����l�^݈@�a0@�ZmtC�9�6XĖ#Ǧ��UR3�ZӨ��Jx^�~ �J(     