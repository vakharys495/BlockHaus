// SPDX-License-Identifier: MIT
use starknet::ContractAddress;

#[starknet::interface]
pub trait IPropertyRentalMarketplace<TContractState> {
    fn list_property(ref self: TContractState, rent_per_month: u256, description: felt252) -> u256;
    fn book_property(ref self: TContractState, property_id: u256, duration_months: u256);
    fn pay_rent(ref self: TContractState, property_id: u256, amount: u256);
    fn get_property(self: @TContractState, property_id: u256) -> (ContractAddress, ContractAddress, u256, bool, felt252);
    fn get_property_count(self: @TContractState) -> u256;
    fn get_usdt_token(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
pub mod PropertyRentalMarketplace {
    use core::num::traits::Zero;
    use openzeppelin::token::erc20::interface::{
        IERC20Dispatcher, IERC20DispatcherTrait as IERC20Trait,
    };
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, contract_address_const, get_caller_address};

    #[derive(starknet::Store, Drop)]
    struct Property {
        owner: ContractAddress,
        tenant: ContractAddress,
        rent_per_month: u256,
        is_available: bool,
        description: felt252,
    }

    #[storage]
    struct Storage {
        properties: Map<u256, Property>,
        property_count: u256,
        usdt_token: ContractAddress,
        
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PropertyListed: PropertyListed,
        PropertyBooked: PropertyBooked,
        RentPaid: RentPaid,
    }

    #[derive(Drop, starknet::Event)]
    struct PropertyListed {
        property_id: u256,
        owner: ContractAddress,
        rent_per_month: u256,
        description: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct PropertyBooked {
        property_id: u256,
        tenant: ContractAddress,
        duration_months: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RentPaid {
        property_id: u256,
        tenant: ContractAddress,
        amount: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, usdt_token: ContractAddress) {
        self.property_count.write(0);
        self.usdt_token.write(usdt_token);
    }

    #[abi(embed_v0)]
    impl PropertyRentalMarketplaceImpl of super::IPropertyRentalMarketplace<ContractState>
    {

        #[abi(external, v0)]
        fn list_property(ref self: ContractState, rent_per_month: u256, description: felt252) -> u256 {
            let property_id = self.property_count.read() + 1;
            let caller = get_caller_address();

            assert(rent_per_month > 0, 'Rent must be positive');

            self
                .properties
                .entry(property_id)
                .write(
                    Property {
                        owner: caller,
                        tenant: contract_address_const::<0>(),
                        rent_per_month: rent_per_month,
                        is_available: true,
                        description: description,
                    },
                );

            self.property_count.write(property_id);

            self
                .emit(
                    Event::PropertyListed(
                        PropertyListed {
                            property_id: property_id,
                            owner: caller,
                            rent_per_month: rent_per_month,
                            description: description,
                        },
                    ),
                );

            property_id
        }

        #[abi(external, v0)]
        fn book_property(ref self: ContractState, property_id: u256, duration_months: u256) {
            let mut property = self.properties.entry(property_id).read();
            let caller = get_caller_address();

            assert(property.owner.is_non_zero(), 'Property does not exist');
            assert(property.is_available, 'Property not available');
            assert(duration_months > 0, 'Duration must be positive');

            property.tenant = caller;
            property.is_available = false;
            self.properties.entry(property_id).write(property);

            self
                .emit(
                    Event::PropertyBooked(
                        PropertyBooked {
                            property_id: property_id, tenant: caller, duration_months: duration_months,
                        },
                    ),
                );
        }

        #[abi(external, v0)]
        fn pay_rent(ref self: ContractState, property_id: u256, amount: u256) {
            let property = self.properties.entry(property_id).read();
            let caller = get_caller_address();

            assert(property.owner.is_non_zero(), 'Property does not exist');
            assert(property.tenant == caller, 'Only tenant can pay rent');
            assert(amount > 0, 'Amount must be positive');


            let usdt_contract = IERC20Dispatcher { contract_address: self.usdt_token.read() };
            let success = usdt_contract.transfer_from(caller, property.owner, amount);
            assert(success, 'Transfer failed');

            self
                .emit(
                    Event::RentPaid(
                        RentPaid { property_id: property_id, tenant: caller, amount: amount },
                    ),
                );
        }

        #[abi(external, v0)]
        fn get_property(
            self: @ContractState, property_id: u256,
        ) -> (ContractAddress, ContractAddress, u256, bool, felt252) {
            let property = self.properties.entry(property_id).read();
            assert(property.owner.is_non_zero(), 'Property does not exist');
            (
                property.owner,
                property.tenant,
                property.rent_per_month,
                property.is_available,
                property.description,
            )
        }

        #[abi(external, v0)]
        fn get_property_count(self: @ContractState) -> u256 {
            self.property_count.read()
        }

        #[abi(external, v0)]
        fn get_usdt_token(self: @ContractState) -> ContractAddress {
            self.usdt_token.read()
        }
    }
}
